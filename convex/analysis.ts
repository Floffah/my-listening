import { v } from "convex/values";

import { internal } from "@/convex/api";
import { Doc } from "@/convex/dataModel";
import {
    internalAction,
    internalMutation,
    internalQuery,
} from "@/convex/server";

import { analysisWorkpool } from "./lib/components";
import { AnalysisStep, vAnalysisStatus, vAnalysisStep } from "./schema";

export const clearAllForUser = internalMutation({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        await analysisWorkpool.cancelAll(ctx);

        const songs = await ctx.db
            .query("analysisSongs")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        for (const song of songs) {
            await ctx.db.delete(song._id);
        }

        const partialSongs = await ctx.db
            .query("partialAnalysisSongs")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        for (const song of partialSongs) {
            await ctx.db.delete(song._id);
        }
    },
});

export const performAnalysisWorkflow = internalAction({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        try {
            await ctx.runMutation(internal.analysis.updateAnalysisWork, {
                userId: args.userId,
                status: "in_progress",
            });

            const user = await ctx.runQuery(
                internal.analysis.analysisGetUser,
                args,
            );

            let step = user.analysisStep ?? -1;

            if (step < AnalysisStep.PARSING) {
                await ctx.runMutation(internal.analysis.updateAnalysisWork, {
                    userId: args.userId,
                    step: AnalysisStep.PARSING,
                });

                const storageIds = await ctx.runAction(
                    internal.analysisnode.decompressAndSave,
                    {
                        storageId: user.analysisStorageId!,
                    },
                );

                for (const fileId of storageIds) {
                    await ctx.runAction(internal.analysis.analysisProcessFile, {
                        fileId,
                        userId: args.userId,
                    });
                }
            }

            if (step <= AnalysisStep.MERGING) {
                await ctx.runMutation(internal.analysis.updateAnalysisWork, {
                    userId: args.userId,
                    step: AnalysisStep.MERGING,
                });

                const startedMergeAt = Date.now();
                let cursor: string | null = null;
                let done = false;
                while (!done) {
                    if (Date.now() - startedMergeAt > 5 * 60 * 1000) {
                        await ctx.runMutation(
                            internal.analysis.updateAnalysisWork,
                            {
                                userId: args.userId,
                                status: "in_progress",
                                message:
                                    "Lots of data, analysis may take a while",
                            },
                        );

                        break;
                    }

                    const result: { nextCursor: string; done: boolean } =
                        await ctx.runMutation(
                            internal.analysis
                                .analysisNextBatchMergePartialAggregates,
                            {
                                userId: args.userId,
                                cursor: cursor,
                            },
                        );
                    cursor = result.nextCursor;
                    done = result.done;
                }

                if (!done) {
                    await analysisWorkpool.enqueueAction(
                        ctx,
                        internal.analysis.performAnalysisWorkflow,
                        args,
                    );
                    return;
                }
            }

            await ctx.runMutation(internal.analysis.updateAnalysisWork, {
                userId: args.userId,
                status: "completed",
            });
        } catch (e) {
            await ctx.runMutation(internal.analysis.updateAnalysisWork, {
                userId: args.userId,
                status: "failed",
            });
            throw e;
        }
    },
});

export const updateAnalysisWork = internalMutation({
    args: v.object({
        userId: v.id("users"),
        status: v.optional(vAnalysisStatus),
        step: v.optional(vAnalysisStep),
        message: v.optional(v.string()),
    }),
    handler: async (ctx, { userId, status, step, message }) => {
        const updateData: Partial<Doc<"users">> = {};

        if (step !== undefined) {
            updateData.analysisStep = step;
        }
        if (message !== undefined) {
            updateData.analysisMessage = message;
        }
        if (status !== undefined) {
            updateData.analysisStatus = status;
        }

        await ctx.db.patch(userId, updateData);
    },
});

export const performAnalysis = internalAction({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        await analysisWorkpool.enqueueAction(
            ctx,
            internal.analysis.performAnalysisWorkflow,
            { userId },
        );
    },
});

export const analysisGetUser = internalQuery({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        return (await ctx.db.get(userId)) as Doc<"users">;
    },
});

const vMapData = v.record(
    v.string(),
    v.object({
        count: v.number(),
        firstPlayed: v.number(),
    }),
);

export const analysisProcessFile = internalAction({
    args: v.object({
        fileId: v.id("_storage"),
        userId: v.id("users"),
    }),
    handler: async (ctx, { fileId, userId }) => {
        const fileBlob = await ctx.storage.get(fileId);
        const fileData = await fileBlob!.arrayBuffer();

        const decoder = new TextDecoder("utf-8");
        const jsonStr = decoder.decode(fileData);
        const itemsData = JSON.parse(jsonStr);

        const songMap = new Map<string, { count: number; firstPlayed: Date }>();

        for (const item of itemsData) {
            if (
                !item.master_metadata_track_name ||
                !item.master_metadata_album_artist_name ||
                !item.master_metadata_album_album_name
            ) {
                continue;
            }

            const playedDate = new Date(item.ts);
            const trackId = item.spotify_track_uri as string;

            if (songMap.has(trackId)) {
                const existing = songMap.get(trackId)!;
                existing.count += 1;
                if (playedDate < existing.firstPlayed) {
                    existing.firstPlayed = playedDate;
                }
            } else {
                songMap.set(trackId, { count: 1, firstPlayed: playedDate });
            }
        }

        const batchSize = 500;
        const entries = Array.from(songMap.entries());
        for (let i = 0; i < entries.length; i += batchSize) {
            const batchEntries = entries.slice(i, i + batchSize);
            const mapData: Record<
                string,
                { count: number; firstPlayed: number }
            > = {};
            for (const [key, info] of batchEntries) {
                mapData[key] = {
                    count: info.count,
                    firstPlayed: info.firstPlayed.getTime(),
                };
            }

            await ctx.runMutation(
                internal.analysis.analysisWriteBatchedAggregateUpdates,
                {
                    data: mapData,
                    userId,
                },
            );
        }

        return null;
    },
});

export const analysisWriteBatchedAggregateUpdates = internalMutation({
    args: v.object({
        data: vMapData,
        userId: v.id("users"),
    }),
    handler: async (ctx, { data, userId }) => {
        for (const [key, info] of Object.entries(data)) {
            await ctx.db.insert("partialAnalysisSongs", {
                userId,
                spotifyId: key,
                timesPlayed: info.count,
                firstPlayed: info.firstPlayed,
            });
        }
    },
});

export const analysisNextBatchMergePartialAggregates = internalMutation({
    args: v.object({
        userId: v.id("users"),
        cursor: v.union(v.string(), v.null()),
    }),
    handler: async (
        ctx,
        { userId, cursor },
    ): Promise<{ nextCursor: string; done: boolean }> => {
        const batchSize = 500;

        const partialSongs = await ctx.db
            .query("partialAnalysisSongs")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .paginate({
                numItems: batchSize,
                cursor,
            });

        for (const partialSong of partialSongs.page) {
            const existingSong = await ctx.db
                .query("analysisSongs")
                .withIndex("userId_spotifyId", (q) =>
                    q
                        .eq("userId", userId)
                        .eq("spotifyId", partialSong.spotifyId),
                )
                .first();

            if (existingSong) {
                await ctx.db.patch(existingSong._id, {
                    timesPlayed:
                        existingSong.timesPlayed + partialSong.timesPlayed,
                    firstPlayed: Math.min(
                        existingSong.firstPlayed,
                        partialSong.firstPlayed,
                    ),
                });
            } else {
                await ctx.db.insert("analysisSongs", {
                    userId,
                    spotifyId: partialSong.spotifyId,
                    timesPlayed: partialSong.timesPlayed,
                    firstPlayed: partialSong.firstPlayed,
                });
            }

            await ctx.db.delete(partialSong._id);
        }

        return {
            nextCursor: partialSongs.continueCursor,
            done: partialSongs.isDone,
        };
    },
});
