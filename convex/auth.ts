import Spotify from "@auth/core/providers/spotify";
import { convexAuth } from "@convex-dev/auth/server";

import { env } from "./convex.env";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Spotify({
            clientId: env.SPOTIFY_CLIENT_ID,
            clientSecret: env.SPOTIFY_CLIENT_SECRET,
            authorization:
                "https://accounts.spotify.com/authorize?scope=user-read-email,playlist-modify-private",
            profile(profile, tokens) {
                console.log(profile, tokens);
                return {
                    id: profile.id,
                    name: profile.display_name,
                    email: profile.email,
                    image: profile.images?.[0]?.url,
                    spotifyAccessData: {
                        access_token: tokens.access_token,
                        token_type: tokens.token_type,
                        expires_in: tokens.expires_in,
                        refresh_token: tokens.refresh_token,
                        expires: tokens.expires_at,
                    },
                };
            },
        }),
    ],
});
