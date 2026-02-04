import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const vAnalysisStatus = v.union(
    v.literal("not_started"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("failed"),
);

export enum AnalysisStep {
    DECOMPRESSING,
    PARSING,
    MERGING,
}

export const vAnalysisStep = v.union(
    v.literal(AnalysisStep.PARSING),
    v.literal(AnalysisStep.MERGING),
);

const schema = defineSchema({
    ...authTables,
    users: defineTable({
        name: v.optional(v.string()),
        image: v.optional(v.string()),
        email: v.optional(v.string()),
        emailVerificationTime: v.optional(v.number()),
        phone: v.optional(v.string()),
        phoneVerificationTime: v.optional(v.number()),
        isAnonymous: v.optional(v.boolean()),

        hasUploadUrl: v.optional(v.boolean()),
        analysisStorageId: v.optional(v.id("_storage")),
        analysisStatus: v.optional(vAnalysisStatus),
        analysisStep: v.optional(vAnalysisStep),
        analysisMessage: v.optional(v.string()),
    }).index("email", ["email"]),

    partialAnalysisSongs: defineTable({
        userId: v.id("users"),
        timesPlayed: v.number(),
        spotifyId: v.string(),
        firstPlayed: v.number(),
    }).index("userId", ["userId"]),

    analysisSongs: defineTable({
        userId: v.id("users"),
        timesPlayed: v.number(),
        spotifyId: v.string(),
        firstPlayed: v.number(),
    })
        .index("userId_timesPlayed", ["userId", "timesPlayed"])
        .index("userId_spotifyId", ["userId", "spotifyId"])
        .index("userId", ["userId"]),
});

export default schema;
