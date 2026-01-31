import Spotify from "@auth/core/providers/spotify";
import { convexAuth } from "@convex-dev/auth/server";

import { env } from "./convex.env";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Spotify({
            clientId: env.SPOTIFY_CLIENT_ID,
            clientSecret: env.SPOTIFY_CLIENT_SECRET,
        }),
    ],
});
