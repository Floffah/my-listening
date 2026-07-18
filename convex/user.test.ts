/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { expect, test } from "vitest";

import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob([
    "./_generated/**/*.ts",
    "./upload.ts",
    "./user.ts",
]);

test("creates and isolates users by Clerk identity", async () => {
    const t = convexTest(schema, modules);
    const user = t.withIdentity({ subject: "user_test" });

    expect(await user.query(api.user.currentUser)).toBeNull();

    await user.mutation(api.upload.generateUploadUrl);

    expect(await user.query(api.user.currentUser)).toMatchObject({
        clerkUserId: "user_test",
    });
    expect(
        await t
            .withIdentity({ subject: "user_other" })
            .query(api.user.currentUser),
    ).toBeNull();
});
