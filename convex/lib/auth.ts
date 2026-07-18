import {
    Auth,
    GenericDatabaseReader,
    GenericDatabaseWriter,
} from "convex/server";
import { ConvexError } from "convex/values";

import type { DataModel } from "@/convex/dataModel";

type AuthContext = {
    db: GenericDatabaseReader<DataModel>;
    auth: Auth;
};

async function findUser(ctx: AuthContext, clerkUserId: string) {
    return await ctx.db
        .query("users")
        .withIndex("clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
        .unique();
}

export async function currentUser(ctx: AuthContext) {
    const identity = await ctx.auth.getUserIdentity();
    return identity ? await findUser(ctx, identity.subject) : null;
}

export async function ensureUser(ctx: AuthContext) {
    const user = await currentUser(ctx);
    if (!user) {
        throw new ConvexError("Unauthorized");
    }

    return user;
}

export async function ensureOrCreateUser(ctx: {
    db: GenericDatabaseWriter<DataModel>;
    auth: Auth;
}) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new ConvexError("Unauthorized");
    }

    const existing = await findUser(ctx, identity.subject);
    if (existing) {
        return existing;
    }

    const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
    });
    return (await ctx.db.get(userId))!;
}
