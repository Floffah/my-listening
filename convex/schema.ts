import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vAnalysisStatus = v.union(
    v.literal("not_started"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("failed"),
);

export enum AnalysisStep {
    PARSING,
    MERGING,
    FILTERING,
}

export const vAnalysisStep = v.union(
    v.literal(-1),
    v.literal(AnalysisStep.PARSING),
    v.literal(AnalysisStep.MERGING),
    v.literal(AnalysisStep.FILTERING),
);

const schema = defineSchema({
    users: defineTable({
        clerkUserId: v.string(),

        hasUploadUrl: v.optional(v.boolean()),
        analysisStartedAt: v.optional(v.number()),
        analysisStorageId: v.optional(v.id("_storage")),
        analysisStatus: v.optional(vAnalysisStatus),
        analysisStep: v.optional(vAnalysisStep),
        analysisMessage: v.optional(v.string()),
        spotifyPlaylistStatus: v.optional(
            v.union(
                v.literal("in_progress"),
                v.literal("completed"),
                v.literal("failed"),
            ),
        ),
        spotifyPlaylistError: v.optional(v.string()),
    }).index("clerkUserId", ["clerkUserId"]),

    partialAnalysisSongs: defineTable({
        userId: v.id("users"),
        timesPlayed: v.number(),
        spotifyId: v.string(),
        firstPlayed: v.number(),
    }).index("userId_spotifyId", ["userId", "spotifyId"]),

    analysisSongs: defineTable({
        userId: v.id("users"),
        timesPlayed: v.number(),
        spotifyId: v.string(),
        firstPlayed: v.number(),
    })
        .index("userId_timesPlayed", ["userId", "timesPlayed"])
        .index("userId_firstPlayed", ["userId", "firstPlayed"])
        .index("userId_spotifyId", ["userId", "spotifyId"]),
});

export default schema;
