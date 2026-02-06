"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { convexAction } from "@convex-dev/react-query";
import { useQuery } from "@tanstack/react-query";
import { usePaginatedQuery } from "convex-helpers/react";
import { useAction, useMutation } from "convex/react";
import { format } from "date-fns";
import Image from "next/image";
import { useMemo } from "react";
import { useOnInView } from "react-intersection-observer";

import LoginWithSpotify from "@/app/LoginWithSpotify";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/api";
import { Doc } from "@/convex/dataModel";

export default function SongsList() {
    const { signOut } = useAuthActions();
    const addToSpotify = useMutation(api.songs.addToSpotify);

    const songs = usePaginatedQuery(
        api.songs.getSongs,
        {},
        {
            initialNumItems: 10,
        },
    );

    const inViewRef = useOnInView((inView) => {
        if (inView && !songs.isLoading) {
            songs.loadMore(10);
        }
    });

    return (
        <div className="flex min-h-0 max-w-lg flex-col gap-4">
            <Button
                onClick={() =>
                    addToSpotify().catch((e) => {
                        const message =
                            e instanceof Error ? e.message : e.toString();

                        if (message.toLowerCase().includes("expired")) {
                            alert(
                                "Your Spotify session has expired. Please log in again.",
                            );
                            signOut().then(window.location.reload);
                        }
                    })
                }
            >
                Create chronological playlist in Spotify
            </Button>

            <LoginWithSpotify />

            {songs.results.map((song) => (
                <SpotifySongCard analysisSong={song} key={song._id} />
            ))}

            <div ref={inViewRef} />
        </div>
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

    const firstPlayedDateStr = useMemo(() => {
        const date = new Date(analysisSong.firstPlayed);

        return format(date, "MMMM d, yyyy");
    }, [analysisSong.firstPlayed]);

    return (
        <div className="flex min-h-0 flex-col gap-4 rounded-xl border border-border bg-card p-4 text-card-foreground">
            <div className="relative flex min-h-0 items-start gap-2">
                {trackData.data?.albumImageUrl && (
                    <img
                        src={trackData.data?.albumImageUrl}
                        alt={`${trackData.data?.album} album cover`}
                        className="aspect-square h-16 shrink-0 grow-0 rounded-lg"
                    />
                )}
                <div className="flex flex-1 flex-col overflow-hidden">
                    <a
                        href={trackData.data?.spotifyUrl}
                        className="min-w-0 overflow-hidden font-bold text-ellipsis whitespace-nowrap hover:underline"
                    >
                        {trackData.data?.title}
                    </a>
                    <p className="min-w-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-muted-foreground">
                        on {trackData.data?.album}
                    </p>
                    <p className="min-w-0 overflow-hidden text-sm text-ellipsis whitespace-nowrap text-muted-foreground">
                        by {trackData.data?.artists.join(", ")}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <p className="text-sm text-muted-foreground">
                    First played: {firstPlayedDateStr}
                </p>
                <p className="text-sm text-muted-foreground"> | </p>
                <p className="text-sm text-muted-foreground">
                    Played {analysisSong.timesPlayed} times
                </p>
            </div>
        </div>
    );
}
