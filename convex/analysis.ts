import { WorkId } from "@convex-dev/workpool";
import { FunctionArgs } from "convex/server";
import { v } from "convex/values";

import { internal } from "@/convex/api";
import { Doc } from "@/convex/dataModel";
import {
    internalAction,
    internalMutation,
    internalQuery,
} from "@/convex/server";

import {
    analysisFileWorkpool,
    analysisItemDispatchWorkpool,
    analysisItemWorkpool,
    counter,
    workflow,
} from "./lib/components";

export const clearAllForUser = internalMutation({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        await analysisItemWorkpool.cancelAll(ctx);
        await analysisFileWorkpool.cancelAll(ctx);

        const songs = await ctx.db
            .query("analysisSongs")
            .withIndex("userId", (q) => q.eq("userId", userId))
            .collect();

        for (const song of songs) {
            await ctx.db.delete(song._id);
        }
    },
});

export const performAnalysisWorkflow = workflow.define({
    args: {
        userId: v.id("users"),
    },
    handler: async (step, args) => {
        const user = await step.runQuery(
            internal.analysis.analysisGetUser,
            args,
        );
        const { storageIds, itemsCount } = await step.runAction(
            internal.analysisnode.decompressAndSave,
            {
                storageId: user.analysisStorageId!,
            },
        );

        // await Promise.all(
        //     individualFileIds.map(async (fileId) => {
        //         await step.runAction(internal.analysis.analysisProcessFile, {
        //             fileId,
        //             userId: args.userId,
        //         });
        //     }),
        // );

        await step.runMutation(internal.analysis.analysisApplyItemsCount, {
            userId: args.userId,
            itemsCount,
        });

        for (const fileId of storageIds) {
            await analysisFileWorkpool.enqueueAction(
                step,
                internal.analysis.analysisProcessFile,
                {
                    fileId,
                    userId: args.userId,
                },
            );
        }
    },
});

export const performAnalysis = internalAction({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        await workflow.start(ctx, internal.analysis.performAnalysisWorkflow, {
            userId,
        });
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

export const analysisApplyItemsCount = internalMutation({
    args: v.object({
        userId: v.id("users"),
        itemsCount: v.number(),
    }),
    handler: async (ctx, { userId, itemsCount }) => {
        await ctx.db.patch(userId, {
            totalWorkItems: itemsCount,
        });
    },
});

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

        const args: FunctionArgs<
            typeof internal.analysis.analysisProcessFileEntry
        >[] = [];

        for (const item of itemsData) {
            if (
                !item.master_metadata_track_name ||
                !item.master_metadata_album_artist_name ||
                !item.master_metadata_album_album_name
            ) {
                continue;
            }

            const playedDate = new Date(item.ts);
            const trackName = item.master_metadata_track_name;
            const artistName = item.master_metadata_album_artist_name;
            const albumName = item.master_metadata_album_album_name;

            args.push({
                ts: playedDate.getTime(),
                trackName: trackName,
                artistName: artistName,
                albumName: albumName,
                userId: userId,
            });
        }

        // batch args into chunks of 8000
        const chunks: FunctionArgs<
            typeof internal.analysis.analysisProcessFileEntry
        >[][] = [];
        const chunkSize = 1000;
        for (let i = 0; i < args.length; i += chunkSize) {
            chunks.push(args.slice(i, i + chunkSize));
        }

        await analysisItemDispatchWorkpool.enqueueActionBatch(
            ctx,
            internal.analysis.enqueueAnalysisFileEntryBatch,
            chunks.map((chunk) => ({ entries: chunk })),
        );

        return null;
    },
});

const vAnalysisProcessFileEntryArgs = v.object({
    ts: v.number(),
    trackName: v.string(),
    artistName: v.string(),
    albumName: v.string(),
    userId: v.id("users"),
});

export const enqueueAnalysisFileEntryBatch = internalAction({
    args: v.object({
        entries: v.array(vAnalysisProcessFileEntryArgs),
    }),
    handler: async (ctx, { entries }) => {
        await analysisItemWorkpool.enqueueMutationBatch(
            ctx,
            internal.analysis.analysisProcessFileEntry,
            entries,
        );
    },
});

export const analysisProcessFileEntry = internalMutation({
    args: vAnalysisProcessFileEntryArgs,
    handler: async (ctx, { ts, trackName, albumName, artistName, userId }) => {
        await counter.inc(
            ctx,
            "analysisProcessFileEntry_calls_for_" + userId.toString(),
        );

        const existingEntry = await ctx.db
            .query("analysisSongs")
            .withIndex("userId_title_artist_album", (q) =>
                q
                    .eq("userId", userId)
                    .eq("title", trackName)
                    .eq("artist", artistName)
                    .eq("album", albumName),
            )
            .collect();

        if (existingEntry.length === 0) {
            await ctx.db.insert("analysisSongs", {
                userId: userId,
                title: trackName,
                artist: artistName,
                album: albumName,
                timesPlayed: 1,
                firstPlayed: ts,
            });
        } else {
            const entry = existingEntry[0];
            await ctx.db.patch(entry._id, {
                timesPlayed: entry.timesPlayed + 1,
                firstPlayed: Math.min(entry.firstPlayed, ts),
            });
        }
    },
});
