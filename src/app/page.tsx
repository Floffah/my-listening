"use client";

import { useAuth } from "@clerk/nextjs";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import LoginWithSpotify from "@/app/LoginWithSpotify";
import {
    ClerkFull,
    ConvexFull,
    SpotifyFull,
    VercelFull,
} from "@/components/icons";

const MotionLoginWithSpotify = motion(LoginWithSpotify);

export default function Page() {
    const { isLoaded, isSignedIn } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isSignedIn) {
            router.replace("/analyse");
        }
    }, [isSignedIn, router]);

    if (!isLoaded || isSignedIn) {
        return null;
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-between p-4">
            <div />

            <main className="flex flex-col items-center justify-center gap-6">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="max-w-sm text-center text-4xl"
                >
                    Uncover your entire listening history
                </motion.h1>
                <MotionLoginWithSpotify
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1, delay: 1 }}
                />
            </main>

            <motion.footer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 2 }}
                className="flex flex-col items-center"
            >
                <p className="text-sm text-muted-foreground">Powered by</p>
                <div className="flex items-center">
                    <a
                        className="transition-transform hover:scale-105"
                        href="https://www.convex.dev"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ConvexFull className="mt-0.5 h-12" />
                    </a>
                    <a
                        className="transition-transform hover:scale-105"
                        href="https://vercel.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <VercelFull className="mr-4 h-4" />
                    </a>
                    <a
                        className="transition-transform hover:scale-105"
                        href="https://spotify.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <SpotifyFull className="h-6" />
                    </a>
                    <a
                        className="ml-3 transition-transform hover:scale-105"
                        href="https://clerk.com"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <ClerkFull className="h-5" />
                    </a>
                </div>
            </motion.footer>
        </div>
    );
}
