"use client";

import { motion } from "motion/react";

import AnalysisProgress from "@/app/analyse/AnalysisProgress";
import Loader from "@/components/Loader";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Doc } from "@/convex/dataModel";

export default function InProgress({ user }: { user: Doc<"users"> }) {
    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-12 lg:grid-cols-2 lg:items-start"
        >
            <div className="flex min-w-0 flex-col items-start gap-6">
                <Badge variant="secondary">Still working</Badge>
                <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tighter sm:text-5xl">
                    Working through your Spotify archive.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    You can close this tab. The analysis will keep running, and
                    this page will show the latest step when you come back.
                </p>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Loader />
                            Right now
                        </CardTitle>
                        <CardDescription aria-live="polite">
                            {user.analysisMessage ?? "Getting the ZIP ready."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="leading-relaxed text-muted-foreground">
                            Bigger archives are split into batches, so this step
                            may take a while.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <aside className="lg:pt-10">
                <AnalysisProgress analysisStep={user.analysisStep} />
            </aside>
        </motion.section>
    );
}
