"use client";

import { motion } from "motion/react";

import LoginWithSpotify from "@/app/LoginWithSpotify";
import { ConvexFull, SpotifyFull, VercelFull } from "@/components/icons";

const MotionLoginWithSpotify = motion(LoginWithSpotify);

export default function Page() {
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
                </div>
            </motion.footer>
        </div>
    );
}
