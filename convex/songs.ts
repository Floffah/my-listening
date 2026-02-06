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
import { vSpotifyAccessToken } from "./schema";

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

        if (!user.spotifyAccessData) {
            throw new ConvexError("User does not have a Spotify access token");
        }
        console.log(user.spotifyAccessData.expires, Date.now() / 1000);
        if (
            !user.spotifyAccessData.expires ||
            user.spotifyAccessData.expires < Date.now() / 1000
        ) {
            throw new ConvexError("User's Spotify access token has expired");
        }

        await ctx.scheduler.runAfter(0, internal.songs.internalCreatePlaylist, {
            userId: user._id,
        });
    },
});

export const internalCreatePlaylist = internalAction({
    args: v.object({
        userId: v.id("users"),
    }),
    handler: async (ctx, { userId }) => {
        const user = await ctx.runQuery(internal.user.internalGetUserById, {
            userId,
        });

        const spotifyUserApi = SpotifyApi.withAccessToken(
            env.SPOTIFY_CLIENT_ID,
            user.spotifyAccessData!,
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

        const tokens = await spotifyUserApi.getAccessToken();

        if (tokens) {
            await ctx.runMutation(internal.songs.internalUpdateSpotifyToken, {
                userId,
                token: {
                    access_token: tokens.access_token,
                    token_type: tokens.token_type,
                    expires_in: tokens.expires_in,
                    refresh_token: tokens.refresh_token,
                    expires: tokens.expires,
                },
            });
        }

        await ctx.runAction(internal.songs.internalAddSongsToPlaylist, {
            userId,
            playlistId: playlist.id,
        });
    },
});

export const internalUpdateSpotifyToken = internalMutation({
    args: v.object({
        userId: v.id("users"),
        token: vSpotifyAccessToken,
    }),
    handler: async (ctx, { userId, token }) => {
        await ctx.db.patch(userId, {
            spotifyAccessData: token,
        });
    },
});

export const internalAddSongsToPlaylist = internalAction({
    args: v.object({
        userId: v.id("users"),
        playlistId: v.string(),
    }),
    handler: async (ctx, { userId, playlistId }) => {
        const user = await ctx.runQuery(internal.user.internalGetUserById, {
            userId,
        });

        const spotifyUserApi = SpotifyApi.withAccessToken(
            env.SPOTIFY_CLIENT_ID,
            user.spotifyAccessData!,
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
                    playlistId,
                    songs.spotifyIds,
                );
            }

            cursor = songs.nextCursor;
            done = songs.done;
        }

        const tokens = await spotifyUserApi.getAccessToken();

        if (tokens) {
            await ctx.runMutation(internal.songs.internalUpdateSpotifyToken, {
                userId,
                token: {
                    access_token: tokens.access_token,
                    token_type: tokens.token_type,
                    expires_in: tokens.expires_in,
                    refresh_token: tokens.refresh_token,
                    expires: tokens.expires,
                },
            });
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
