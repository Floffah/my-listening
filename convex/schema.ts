import { authTables } from "@convex-dev/auth/server";
import { vWorkId } from "@convex-dev/workpool";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
        analysisStatus: v.optional(
            v.union(
                v.literal("not_started"),
                v.literal("in_progress"),
                v.literal("completed"),
                v.literal("failed"),
            ),
        ),
        totalWorkItems: v.optional(v.number()),
        // fileWorkIds: v.optional(v.array(vWorkId)),
    }).index("email", ["email"]),

    analysisSongs: defineTable({
        userId: v.id("users"),
        title: v.string(),
        artist: v.string(),
        album: v.string(),
        timesPlayed: v.number(),
        spotifyId: v.optional(v.string()),
        firstPlayed: v.number(),
    })
        .index("userId_title_artist_album", [
            "userId",
            "title",
            "artist",
            "album",
        ])
        .index("userId", ["userId"]),
});

export default schema;
