"use client";

import { useMutation } from "@tanstack/react-query";
import { useMutation as useConvexMutation } from "convex/react";
import { motion } from "motion/react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/api";

export default function Upload() {
    const getUploadUrl = useConvexMutation(api.upload.generateUploadUrl);
    const startAnalysis = useConvexMutation(api.upload.startAnalysis);

    const uploadFile = useMutation({
        mutationFn: async ({ file }: { file: File }) => {
            if (file.type !== "application/zip") {
                return alert("Please upload a .zip file");
            }

            const uploadUrl = await getUploadUrl();

            const result = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file!.type },
                body: file,
            });
            const { storageId } = await result.json();

            await startAnalysis({ storageId });
        },
    });

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
            <p className="text-sm text-muted-foreground">Step 1</p>
            <div className="flex flex-col items-center gap-4">
                <h1 className="max-w-sm text-center text-4xl">
                    Upload your Spotify streaming history
                </h1>
                <p className="max-w-md text-center text-muted-foreground">
                    Spotify doesn't store your entire streaming history on your
                    account. But, you can request the long term storage data
                    from Spotify and upload it here for analysis.
                </p>
                <Button variant="link" asChild>
                    <Link href="/analyse/how">Learn how</Link>
                </Button>

                <Input
                    type="file"
                    accept=".zip"
                    className="cursor-pointer"
                    disabled={uploadFile.isPending || uploadFile.isSuccess}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            uploadFile.mutate({ file });
                        }
                    }}
                />
            </div>
        </motion.div>
    );
}
