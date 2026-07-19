import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";
import type { Metadata } from "next";
import { JetBrains_Mono, Nunito } from "next/font/google";
import { PropsWithChildren } from "react";

import { ConvexClientProvider } from "@/components/provider/ConvexClientProvider";
import { cn } from "@/lib/utils";

import "./globals.css";

const sansFont = Nunito({
    variable: "--font-app-sans",
    subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
    variable: "--font-app-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "My Listening | Find your most-played Spotify tracks",
    description:
        "Upload your Spotify Extended Streaming History to find the tracks you played at least ten times and sort them by first play.",
};

export default function RootLayout({ children }: PropsWithChildren) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={cn(
                    "antialiased",
                    sansFont.variable,
                    monoFont.variable,
                )}
            >
                <ClerkProvider appearance={{ theme: shadcn }}>
                    <ConvexClientProvider>{children}</ConvexClientProvider>
                </ClerkProvider>
            </body>
        </html>
    );
}
