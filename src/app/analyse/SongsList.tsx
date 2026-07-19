"use client";

import { useClerk } from "@clerk/nextjs";
import { convexAction } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex-helpers/react";
import { useConvex, useMutation } from "convex/react";
import { format } from "date-fns";
import { CheckCircle2Icon, DownloadIcon, ListMusicIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useOnInView } from "react-intersection-observer";

import AnalysisProgress from "@/app/analyse/AnalysisProgress";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { api } from "@/convex/api";
import type { Doc } from "@/convex/dataModel";

const eligibilityCopy = {
    eligible: "Spotify will let this account create the playlist.",
    not_connected:
        "This account is not connected to Spotify. Download the track IDs instead, or run the project with your own Spotify setup.",
    not_whitelisted:
        "Spotify let you sign in, but this account is not approved for the app's Development Mode. Download the IDs or run your own fork.",
    missing_scope:
        "Spotify is connected, but it only granted sign-in access. Reconnect it once to allow private playlists.",
    spotify_unavailable:
        "Spotify did not answer the access check, so playlist creation is off for now. You can download the result as JSON.",
} as const;

export default function SongsList({ user }: { user: Doc<"users"> }) {
    const { openUserProfile } = useClerk();
    const convex = useConvex();
    const addToSpotify = useMutation(api.songs.addToSpotify);
    const eligibility = useQuery(
        convexAction(api.songs.getSpotifyEligibility, {}),
    );
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState<string>();
    const [playlistError, setPlaylistError] = useState<string>();

    const songs = usePaginatedQuery(
        api.songs.getSongs,
        {},
        { initialNumItems: 10 },
    );

    const inViewRef = useOnInView((inView) => {
        if (inView && !songs.isLoading) {
            songs.loadMore(10);
        }
    });

    async function downloadSpotifyIds() {
        setDownloadError(undefined);
        setIsDownloading(true);

        try {
            const spotifyIds: string[] = [];
            let cursor: string | null = null;
            let done = false;

            while (!done) {
                const page: {
                    page: Doc<"analysisSongs">[];
                    continueCursor: string;
                    isDone: boolean;
                } = await convex.query(api.songs.getSongs, {
                    paginationOpts: { cursor, numItems: 100 },
                });

                spotifyIds.push(
                    ...page.page.map((song) =>
                        song.spotifyId.split(":").at(-1)!,
                    ),
                );
                cursor = page.continueCursor;
                done = page.isDone;
            }

            const url = URL.createObjectURL(
                new Blob([JSON.stringify({ spotifyIds }, null, 2)], {
                    type: "application/json",
                }),
            );
            const anchor = document.createElement("a");
            anchor.href = url;
            anchor.download = "my-listening-spotify-ids.json";
            document.body.append(anchor);
            anchor.click();
            anchor.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            setDownloadError(
                error instanceof Error
                    ? error.message
                    : "The JSON file could not be prepared. Try again.",
            );
        } finally {
            setIsDownloading(false);
        }
    }

    const canCreatePlaylist =
        eligibility.data?.reason === "eligible" &&
        eligibility.data.canCreatePlaylist;

    return (
        <section className="flex flex-col gap-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
                <div className="flex min-w-0 flex-col items-start gap-6">
                    <Badge variant="default">Done</Badge>
                    <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tighter sm:text-5xl">
                        Here are the tracks that made the cut.
                    </h1>
                    <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                        These are the tracks you played at least ten times,
                        sorted by their first play in the archive.
                    </p>

                    {eligibility.isPending && (
                        <Card className="w-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Loader />
                                    Checking your Spotify account
                                </CardTitle>
                                <CardDescription>
                                    We are checking whether this account can
                                    create a playlist.
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    )}

                    {!eligibility.isPending && canCreatePlaylist && (
                        <Card className="w-full">
                            <CardHeader>
                                <Badge variant="secondary">
                                    Playlist available
                                </Badge>
                                <CardTitle>Send it to Spotify</CardTitle>
                                <CardDescription>
                                    Spotify has approved this account for the
                                    hosted app.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-muted-foreground">
                                    We add the tracks oldest first. Long lists
                                    can take a few minutes.
                                </p>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-3 sm:flex-row sm:items-center">
                                <Button
                                    size="lg"
                                    disabled={
                                        user.spotifyPlaylistStatus ===
                                        "in_progress"
                                    }
                                    onClick={() => {
                                        setPlaylistError(undefined);
                                        void addToSpotify().catch((error) =>
                                            setPlaylistError(
                                                error instanceof Error
                                                    ? error.message
                                                    : "Spotify could not create the playlist. Try again.",
                                            ),
                                        );
                                    }}
                                >
                                    {user.spotifyPlaylistStatus ===
                                    "in_progress" ? (
                                        <>
                                            <Loader data-icon="inline-start" />
                                            Creating the playlist…
                                        </>
                                    ) : (
                                        <>
                                            <ListMusicIcon data-icon="inline-start" />
                                            Create Spotify playlist
                                        </>
                                    )}
                                </Button>
                                {user.spotifyPlaylistStatus === "completed" && (
                                    <p
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                        role="status"
                                    >
                                        <CheckCircle2Icon
                                            aria-hidden="true"
                                            className="size-4 text-spotify"
                                        />
                                        Created in Spotify.
                                    </p>
                                )}
                            </CardFooter>
                        </Card>
                    )}

                    {!eligibility.isPending && !canCreatePlaylist && (
                        <Card className="w-full">
                            <CardHeader>
                                <Badge variant="secondary">JSON download</Badge>
                                <CardTitle>Download the Spotify IDs</CardTitle>
                                <CardDescription>
                                    {eligibility.isError
                                        ? eligibilityCopy.spotify_unavailable
                                        : eligibilityCopy[
                                              eligibility.data?.reason ??
                                                  "spotify_unavailable"
                                          ]}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="leading-relaxed text-muted-foreground">
                                    The file has one ordered
                                    <code className="mx-1 font-mono text-foreground">
                                        spotifyIds
                                    </code>
                                    array. It matches the order of your result.
                                </p>
                            </CardContent>
                            <CardFooter className="flex-col items-start gap-3 sm:flex-row">
                                <Button
                                    size="lg"
                                    onClick={() => void downloadSpotifyIds()}
                                    disabled={isDownloading}
                                >
                                    {isDownloading ? (
                                        <Loader data-icon="inline-start" />
                                    ) : (
                                        <DownloadIcon data-icon="inline-start" />
                                    )}
                                    {isDownloading
                                        ? "Preparing the file…"
                                        : "Download the JSON"}
                                </Button>
                                {eligibility.data?.reason ===
                                    "missing_scope" && (
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        onClick={() =>
                                            openUserProfile({
                                                additionalOAuthScopes: {
                                                    spotify: [
                                                        "playlist-modify-private",
                                                    ],
                                                },
                                            })
                                        }
                                    >
                                        Reconnect Spotify
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )}

                    {(playlistError ||
                        user.spotifyPlaylistStatus === "failed") && (
                        <p className="text-sm text-destructive" role="alert">
                            {playlistError ||
                                user.spotifyPlaylistError ||
                                "Spotify could not create the playlist. Download the JSON instead."}
                        </p>
                    )}
                    {downloadError && (
                        <p className="text-sm text-destructive" role="alert">
                            {downloadError}
                        </p>
                    )}
                </div>

                <aside className="lg:pt-10">
                    <AnalysisProgress completed />
                </aside>
            </div>

            {canCreatePlaylist && (
                <div className="flex flex-col gap-6">
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <h2 className="font-display text-2xl font-bold tracking-tight">
                            Tracks
                        </h2>
                        <p className="text-muted-foreground">
                            Album details appear as each track loads.
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {songs.results.map((song) => (
                            <SpotifySongCard
                                analysisSong={song}
                                key={song._id}
                            />
                        ))}
                    </div>
                    <div ref={inViewRef} className="h-1" />
                </div>
            )}
        </section>
    );
}

function SpotifySongCard({
    analysisSong,
}: {
    analysisSong: Doc<"analysisSongs">;
}) {
    const trackData = useQuery(
        convexAction(api.songs.getSpotifySongData, {
            spotifyId: analysisSong.spotifyId,
        }),
    );

    const firstPlayedDateStr = useMemo(
        () => format(new Date(analysisSong.firstPlayed), "MMMM d, yyyy"),
        [analysisSong.firstPlayed],
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {trackData.data?.spotifyUrl ? (
                        <a
                            href={trackData.data.spotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex min-h-11 items-center truncate transition-opacity hover:underline active:opacity-70"
                        >
                            {trackData.data.title}
                        </a>
                    ) : (
                        "Loading…"
                    )}
                </CardTitle>
                <CardDescription className="truncate">
                    {trackData.data
                        ? `${trackData.data.artists.join(", ")} · ${trackData.data.album}`
                        : analysisSong.spotifyId}
                </CardDescription>
                {trackData.data?.albumImageUrl && (
                    <CardAction>
                        <img
                            src={trackData.data.albumImageUrl}
                            alt={`${trackData.data.album} album cover`}
                            width="64"
                            height="64"
                            loading="lazy"
                            className="size-16 rounded-lg object-cover"
                        />
                    </CardAction>
                )}
            </CardHeader>
            <CardContent>
                <p className="truncate font-mono text-xs text-muted-foreground">
                    {analysisSong.spotifyId}
                </p>
            </CardContent>
            <CardFooter className="flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">
                    {firstPlayedDateStr}
                </span>
                <span className="text-muted-foreground" aria-hidden="true">
                    ·
                </span>
                <span className="text-sm text-muted-foreground">
                    {analysisSong.timesPlayed} plays
                </span>
            </CardFooter>
        </Card>
    );
}
