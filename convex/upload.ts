import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import { mutation } from "./_generated/server";
import { ensureOrCreateUser, ensureUser } from "./lib/auth";

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const user = await ensureOrCreateUser(ctx);

        // if (user.hasUploadUrl) {
        //     throw new ConvexError("User already has an upload URL");
        // }

        const uploadUrl = await ctx.storage.generateUploadUrl();

        await ctx.db.patch(user._id, { hasUploadUrl: true });

        return uploadUrl;
    },
});

export const startAnalysis = mutation({
    args: v.object({
        storageId: v.id("_storage"),
    }),
    handler: async (ctx, { storageId }) => {
        const user = await ensureUser(ctx);

        if (user.analysisStatus && user.analysisStatus !== "not_started") {
            throw new ConvexError("User already has an analysis in progress");
        }

        const storageUrl = ctx.storage.getUrl(storageId);

        if (!storageUrl) {
            throw new ConvexError("Invalid storage ID");
        }

        await ctx.db.patch(user._id, {
            analysisStorageId: storageId,
            analysisStartedAt: Date.now(),
            analysisStatus: "in_progress",
            analysisStep: -1,
            analysisMessage: undefined,
        });

        await ctx.scheduler.runAfter(0, internal.analysis.performAnalysis, {
            userId: user._id,
        });

        return "ok";
    },
});
