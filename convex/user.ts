import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery, query } from "./_generated/server";
import { ensureUser, currentUser as getCurrentUser } from "./lib/auth";

export const currentUser = query({
    args: {},
    handler: getCurrentUser,
});

export const internalEnsureUser = internalQuery({
    handler: async (ctx) => {
        return await ensureUser(ctx);
    },
});

export const internalGetUserById = internalQuery({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, { userId }) => {
        return (await ctx.db.get(userId)) as Doc<"users">;
    },
});
