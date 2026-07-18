import { vOnCompleteArgs } from "@convex-dev/workpool";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";
import { paginationOptsValidator } from "convex/server";
import { ConvexError, v } from "convex/values";

import { internal } from "@/convex/api";
import {
    action,
    internalAction,
    internalMutation,
    internalQuery,
    mutation,
    query,
} from "@/convex/server";

import { env } from "./convex.env";
import { ensureUser } from "./lib/auth";
import { spotifyAddWorkpool } from "./lib/components";

const spotify = SpotifyApi.withClientCredentials(
    env.SPOTIFY_CLIENT_ID,
    env.SPOTIFY_CLIENT_SECRET,
);

export const getSongs = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, { paginationOpts }) => {
        const user = await ensureUser(ctx);

        const songs = await ctx.db
            .query("analysisSongs")
            .withIndex("userId_firstPlayed", (q) => q.eq("userId", user._id))
            .order("asc")
            .paginate(paginationOpts);

        // const tracks: any[] = [];

        return songs;
    },
});

export const getSpotifySongData = action({
    args: v.object({
        spotifyId: v.string(),
    }),
    handler: async (ctx, { spotifyId }) => {
        if (!(await ctx.auth.getUserIdentity())) {
            throw new ConvexError("Unauthorized");
        }

        const [, type, id] = spotifyId.split(":");

        if (!type || !id || type !== "track") {
            throw new Error("Invalid Spotify ID");
        }

        const track = await spotify.tracks.get(id);
        return {
            title: track.name,
            artists: track.artists.map((artist) => artist.name),
            album: track.album.name,
            albumImageUrl: track.album.images[0]?.url || null,
            durationMs: track.duration_ms,
            spotifyUrl: track.external_urls.spotify,
        };
    },
});

export const addToSpotify = mutation({
    handler: async (ctx) => {
        const user = await ensureUser(ctx);

        if (user.spotifyPlaylistStatus === "in_progress") {
            throw new ConvexError(
                "A Spotify playlist is already being created",
            );
        }

        await ctx.db.patch(user._id, {
            spotifyPlaylistStatus: "in_progress",
            spotifyPlaylistError: undefined,
        });

        await spotifyAddWorkpool.enqueueAction(
            ctx,
            internal.songs.internalAddSongsToPlaylist,
            {
                userId: user._id,
            },
            {
                onComplete: internal.songs.spotifyPlaylistCompleted,
                context: { userId: user._id },
            },
        );
    },
});

export const spotifyPlaylistCompleted = internalMutation({
    args: vOnCompleteArgs(v.object({ userId: v.id("users") })),
    handler: async (ctx, { context, result }) => {
        await ctx.db.patch(context.userId, {
            spotifyPlaylistStatus:
                result.kind === "success" ? "completed" : "failed",
            spotifyPlaylistError:
                result.kind === "failed"
                    ? result.error
                    : result.kind === "canceled"
                      ? "Playlist creation was canceled"
                      : undefined,
        });
    },
});

export const internalAddSongsToPlaylist = internalAction({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        const user = await ctx.runQuery(internal.user.internalGetUserById, {
            userId,
        });

        const response = await fetch(
            `https://api.clerk.com/v1/users/${encodeURIComponent(user.clerkUserId)}/oauth_access_tokens/oauth_spotify?paginated=true`,
            {
                headers: { Authorization: `Bearer ${env.CLERK_SECRET_KEY}` },
            },
        );

        if (!response.ok) {
            throw new ConvexError("Could not access your Spotify connection");
        }

        const body = (await response.json()) as
            | { data: { token: string; scopes?: string[] }[] }
            | { token: string; scopes?: string[] }[];
        const data = Array.isArray(body) ? body : body.data;
        const spotifyToken = data[0];

        if (!spotifyToken) {
            throw new ConvexError("Spotify is not connected to this account");
        }
        if (
            spotifyToken.scopes &&
            !spotifyToken.scopes.includes("playlist-modify-private")
        ) {
            throw new ConvexError(
                "Spotify needs permission to create private playlists",
            );
        }

        const spotifyUserApi = SpotifyApi.withAccessToken(
            env.SPOTIFY_CLIENT_ID,
            {
                access_token: spotifyToken.token,
                token_type: "Bearer",
                expires_in: 0,
                refresh_token: "",
            },
        );

        const profile = await spotifyUserApi.currentUser.profile();

        const playlist = await spotifyUserApi.playlists.createPlaylist(
            profile.id,
            {
                collaborative: false,
                name: "My listening history",
                description:
                    "A playlist of all the songs I've listened to, generated using My Listening by Floffah",
                public: false,
            },
        );

        let done = false;
        let cursor: string | null = null;

        while (!done) {
            const songs: {
                spotifyIds: string[];
                nextCursor: string;
                done: boolean;
            } = await ctx.runQuery(internal.songs.internalGetNextPageOfSongs, {
                userId,
                cursor,
            });

            if (songs.spotifyIds.length > 0) {
                await spotifyUserApi.playlists.addItemsToPlaylist(
                    playlist.id,
                    songs.spotifyIds,
                );
            }

            cursor = songs.nextCursor;
            done = songs.done;
        }
    },
});

export const internalGetNextPageOfSongs = internalQuery({
    args: v.object({
        userId: v.id("users"),
        cursor: paginationOptsValidator.fields.cursor,
    }),
    handler: async (ctx, { userId, cursor }) => {
        const songs = await ctx.db
            .query("analysisSongs")
            .withIndex("userId_firstPlayed", (q) => q.eq("userId", userId))
            .order("asc")
            .paginate({ cursor, numItems: 100 });

        const spotifyIds = songs.page.map((song) => song.spotifyId);

        return {
            spotifyIds,
            nextCursor: songs.continueCursor,
            done: songs.isDone,
        };
    },
});
