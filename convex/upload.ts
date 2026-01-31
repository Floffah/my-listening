import { ConvexError, v } from "convex/values";

import { internal } from "@/convex/api";
import { mutation } from "@/convex/server";

import { ensureUser } from "./lib/auth";

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const user = await ensureUser(ctx);

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
    handler: async (ctx, args) => {
        const user = await ensureUser(ctx);

        if (user.analysisStatus && user.analysisStatus !== "not_started") {
            throw new ConvexError("User already has an analysis in progress");
        }

        await ctx.db.patch(user._id, {
            analysisStorageId: args.storageId,
            analysisStatus: "in_progress",
        });

        ctx.scheduler.runAfter(0, internal.analysis.performAnalysis, {
            userId: user._id,
        });

        return "ok";
    },
});
