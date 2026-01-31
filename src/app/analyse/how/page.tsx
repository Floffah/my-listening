"use client";

import { ArrowLeftIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import GetSpotifyData from "@/public/data.png";
import ReceivedSpotifyData from "@/public/received.png";

export default function Page() {
    const [step, setStep] = useState(0);

    return (
        <div className="flex flex-col items-center">
            <Button variant="link" asChild>
                <Link href="/analyse">
                    <ArrowLeftIcon /> Back to Upload
                </Link>
            </Button>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex max-w-md flex-col items-center gap-4 text-center"
                        key="step-1"
                    >
                        <p>
                            Go to your{" "}
                            <a
                                href="https://www.spotify.com/account/privacy/"
                                className="text-blue-200 underline"
                            >
                                Spotify privacy page
                            </a>
                            , select the data options below, and request your
                            data.
                        </p>

                        <Image
                            src={GetSpotifyData}
                            alt="Select ONLY extended streaming history, nothing else."
                        />

                        <Button size="lg" onClick={() => setStep(step + 1)}>
                            I did it!
                        </Button>
                    </motion.div>
                )}
                {step === 1 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex max-w-md flex-col items-center gap-4 text-center"
                        key="step-2"
                    >
                        <p>
                            Wait for a few days, or weeks, until you receive an
                            email from Spotify with a link to download your
                            data.
                        </p>

                        <Button size="lg" onClick={() => setStep(step + 1)}>
                            I got the email...
                        </Button>
                    </motion.div>
                )}
                {step === 2 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex max-w-md flex-col items-center gap-4 text-center"
                        key="step-3"
                    >
                        <p>
                            Download the ZIP file from the email, and upload it
                            with the uploader on the previous page.
                        </p>

                        <Image
                            src={ReceivedSpotifyData}
                            alt="Email from Spotify with download link."
                        />

                        <Button size="lg" asChild>
                            <Link href="/analyse">Got it, take me back</Link>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
