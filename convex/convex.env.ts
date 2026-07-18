import { createEnv } from "convex-env";
import { environment } from "convex-env/presets";
import { v } from "convex/values";

export const env = createEnv({
    ...environment,

    CLERK_SECRET_KEY: v.string(),

    // ours
    SPOTIFY_CLIENT_ID: v.string(),
    SPOTIFY_CLIENT_SECRET: v.string(),
});
