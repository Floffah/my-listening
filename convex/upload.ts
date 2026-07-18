import { ConvexError, v } from "convex/values";

import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { ensureOrCreateUser, ensureUser } from "./lib/auth";

export function canStartAnalysis(status: Doc<"users">["analysisStatus"]) {
    return !status || status === "not_started" || status === "failed";
}

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

        if (!canStartAnalysis(user.analysisStatus)) {
            throw new ConvexError("User already has an analysis in progress");
        }

        const storageUrl = await ctx.storage.getUrl(storageId);

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
