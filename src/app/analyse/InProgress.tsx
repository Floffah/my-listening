"use client";

import { motion } from "motion/react";

import Loader from "@/components/Loader";
import { Doc } from "@/convex/dataModel";

export default function InProgress({ user }: { user: Doc<"users"> }) {
    return (
        <motion.div
            initial={{
                opacity: 0,
            }}
            animate={{
                opacity: 1,
            }}
            exit={{
                opacity: 0,
            }}
            className="flex flex-col items-center"
        >
            <p className="text-sm text-muted-foreground">Step 2</p>
            <div className="flex flex-col items-center gap-4">
                <h1 className="flex max-w-sm items-center gap-4 text-center text-4xl">
                    <Loader className="size-6" />
                    Analysing your data...
                </h1>

                <p className="max-w-md text-center text-muted-foreground">
                    We may have questions for you so don't close the tab! If you
                    accidentally close it or refresh, don't worry, the analysis
                    will continue in the background (but may pause if you
                    neglect our questions)
                </p>

                {typeof user.analysisStep === "number" && (
                    <p className="text-xs text-muted-foreground">
                        Current analysis step: {user.analysisStep}
                    </p>
                )}

                {user.analysisMessage && (
                    <p className="text-xs text-muted-foreground">
                        {user.analysisMessage}
                    </p>
                )}
            </div>
        </motion.div>
    );
}
