"use client";

import { useMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import { FileArchiveIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import AnalysisProgress from "@/app/analyse/AnalysisProgress";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/api";

export default function Upload({ isRetry = false }: { isRetry?: boolean }) {
    const getUploadUrl = useConvexMutation(api.upload.generateUploadUrl);
    const startAnalysis = useConvexMutation(api.upload.startAnalysis);

    const uploadFile = useMutation({
        mutationFn: async ({ file }: { file: File }) => {
            if (!file.name.toLowerCase().endsWith(".zip")) {
                throw new Error("That file needs to be a ZIP.");
            }

            const uploadUrl = await getUploadUrl();

            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type || "application/zip" },
                body: file,
            });

            if (!result.ok) {
                throw new Error("The ZIP could not be uploaded. Try again.");
            }

            const { storageId } = await result.json();

            await startAnalysis({ storageId });
        },
    });

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-12 lg:grid-cols-2 lg:items-start"
        >
            <div className="flex min-w-0 flex-col items-start gap-6">
                <p className="font-mono text-sm text-spotify">Start here</p>
                <h1 className="max-w-2xl font-display text-4xl leading-tight font-bold tracking-tighter sm:text-5xl">
                    Upload your Spotify archive.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    Spotify&apos;s normal listening history doesn&apos;t go back
                    far enough. The Extended Streaming History ZIP has the play
                    data this tool needs.
                </p>
                <Button variant="link" size="lg" asChild>
                    <Link href="/analyse/how">Where to get the ZIP</Link>
                </Button>

                <Card className="w-full">
                    <CardHeader>
                        <CardTitle>Choose your Spotify ZIP</CardTitle>
                        <CardDescription>
                            Leave it zipped. Analysis starts when the upload
                            finishes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FieldGroup>
                            <Field
                                data-invalid={
                                    isRetry || Boolean(uploadFile.error)
                                }
                                data-disabled={
                                    uploadFile.isPending || uploadFile.isSuccess
                                }
                            >
                                <FieldLabel htmlFor="spotify-archive">
                                    Spotify ZIP
                                </FieldLabel>
                                <Input
                                    id="spotify-archive"
                                    type="file"
                                    accept=".zip,application/zip"
                                    aria-invalid={
                                        isRetry || Boolean(uploadFile.error)
                                    }
                                    disabled={
                                        uploadFile.isPending ||
                                        uploadFile.isSuccess
                                    }
                                    onChange={(event) => {
                                        const file = event.target.files?.[0];
                                        if (file) {
                                            uploadFile.mutate({ file });
                                            event.currentTarget.value = "";
                                        }
                                    }}
                                />
                                <FieldDescription>
                                    Use the ZIP Spotify emailed you.
                                </FieldDescription>
                                {(isRetry || uploadFile.error) && (
                                    <FieldError>
                                        {uploadFile.error?.message ??
                                            "The last analysis failed. Choose the ZIP again to retry."}
                                    </FieldError>
                                )}
                                {uploadFile.isPending && (
                                    <p
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                        role="status"
                                    >
                                        <FileArchiveIcon
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                        Uploading your ZIP…
                                    </p>
                                )}
                            </Field>
                        </FieldGroup>
                    </CardContent>
                </Card>
            </div>

            <aside className="lg:pt-10">
                <AnalysisProgress />
            </aside>
        </motion.section>
    );
}
