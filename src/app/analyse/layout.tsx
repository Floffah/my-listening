import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
        redirect("/");
    }

    return (
        <div className="min-h-svh">
            <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
                <Link
                    href="/analyse"
                    className="flex min-h-11 items-center font-display text-sm font-bold tracking-tight whitespace-nowrap transition-opacity active:opacity-70"
                >
                    MY LISTENING
                </Link>
                <p className="hidden font-mono text-xs text-muted-foreground sm:block">
                    Archive analysis · private workspace
                </p>
                <div className="flex size-11 items-center justify-center">
                    <UserButton
                        userProfileProps={{
                            additionalOAuthScopes: {
                                spotify: ["playlist-modify-private"],
                            },
                        }}
                    />
                </div>
            </header>
            <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-16 lg:px-12">
                {children}
            </main>
        </div>
    );
}
