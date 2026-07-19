"use client";

import { useAuth } from "@clerk/nextjs";
import { ArrowUpRightIcon, GitForkIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoginWithSpotify from "@/app/LoginWithSpotify";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isSignedIn) {
            router.replace("/analyse");
        }
    }, [isSignedIn, router]);

    if (isSignedIn) {
        return null;
    }

    return (
        <div className="flex min-h-svh flex-col">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
                <Link
                    href="/"
                    className="flex min-h-11 items-center font-display text-sm font-bold tracking-tight whitespace-nowrap transition-opacity active:opacity-70"
                >
                    MY LISTENING
                </Link>
                <Button variant="outline" size="lg" asChild>
                    <a
                        href="https://github.com/Floffah/my-listening"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <GitForkIcon data-icon="inline-start" />
                        Fork on GitHub
                    </a>
                </Button>
            </header>

            <main className="mx-auto grid w-full max-w-7xl flex-1 gap-12 px-5 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-24">
                <section className="flex min-w-0 flex-col items-start gap-7">
                    <div className="flex min-w-0 flex-col gap-5">
                        <h1 className="max-w-3xl min-w-0 font-display text-4xl leading-tight font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl">
                            See every song you've loved.
                        </h1>
                        <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                            Upload your Spotify Extended Streaming History ZIP.
                            My Listening adds up repeat plays across the
                            archive. We sort songs you've loved by their first
                            play.
                        </p>
                    </div>
                    <div className="flex flex-col items-start gap-3">
                        <LoginWithSpotify disabled={!isLoaded} />
                        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
                            Sign in to upload your archive. We check playlist
                            access when the analysis finishes.
                        </p>
                    </div>
                </section>

                <aside className="flex min-w-0 flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <Badge variant="destructive">WARNING</Badge>
                            <CardTitle>
                                Spotify may block playlist creation.
                            </CardTitle>
                            <CardDescription>
                                Development Mode only works for up to five
                                approved users. If this account is not on the
                                list, the playlist request fails.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <p className="leading-relaxed text-muted-foreground">
                                In order to lift this limitation, I would need
                                to be operating on behalf of a registered
                                business, but I am an individual developer.
                            </p>
                            <p className="leading-relaxed text-muted-foreground">
                                You will still get a JSON file containing every
                                Spotify track ID. If you want the playlist
                                button to work, fork the project and use your
                                own Spotify developer app.
                            </p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" size="lg" asChild>
                                <a
                                    href="https://github.com/Floffah/my-listening"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    View on GitHub
                                    <ArrowUpRightIcon data-icon="inline-end" />
                                </a>
                            </Button>
                        </CardFooter>
                    </Card>

                    <ol className="grid gap-4 font-mono text-sm sm:grid-cols-3 lg:grid-cols-1">
                        {[
                            ["01", "Read the ZIP"],
                            ["02", "Count repeat plays"],
                            ["03", "Download or create"],
                        ].map(([number, label]) => (
                            <li
                                key={number}
                                className="flex items-baseline gap-4"
                            >
                                <span className="text-spotify">{number}</span>
                                <span>{label}</span>
                            </li>
                        ))}
                    </ol>
                </aside>
            </main>

            <footer className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 sm:px-8 lg:px-12">
                <Separator />
                <p className="max-w-2xl font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                    If Spotify blocks the playlist, download the track IDs
                    instead.
                </p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <span>My Listening · open source</span>
                    <span>Clerk · Convex · Spotify · Vercel</span>
                </div>
            </footer>
        </div>
    );
}
