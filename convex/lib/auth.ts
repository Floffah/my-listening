import { getAuthUserId } from "@convex-dev/auth/server";
import {
    Auth,
    GenericDatabaseReader,
    GenericDatabaseWriter,
} from "convex/server";
import { ConvexError } from "convex/values";

import { DataModel } from "@/convex/dataModel";

export async function ensureUser(ctx: {
    db: GenericDatabaseWriter<DataModel> | GenericDatabaseReader<DataModel>;
    auth: Auth;
}) {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
        throw new ConvexError("Unauthorized");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
        throw new ConvexError("Unauthorized");
    }

    return user;
}
