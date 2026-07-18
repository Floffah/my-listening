"use client";

import { useQuery } from "convex/react";
import { AnimatePresence } from "motion/react";

import InProgress from "@/app/analyse/InProgress";
import SongsList from "@/app/analyse/SongsList";
import Upload from "@/app/analyse/Upload";
import { api } from "@/convex/api";

export default function Page() {
    const currentUser = useQuery(api.user.currentUser);

    if (currentUser === undefined) {
        return null;
    }

    return (
        <AnimatePresence mode="wait">
            {(!currentUser ||
                currentUser.analysisStatus === "not_started" ||
                !currentUser.analysisStatus) && <Upload key="upload" />}

            {currentUser?.analysisStatus === "in_progress" && (
                <InProgress key="in-progress" user={currentUser} />
            )}
            {currentUser?.analysisStatus === "completed" && (
                <SongsList key="songs-list" />
            )}
        </AnimatePresence>
    );
}
