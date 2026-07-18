"use node";

import { v } from "convex/values";
import { strFromU8, unzipSync } from "fflate";

import { Id } from "@/convex/dataModel";
import { internalAction } from "@/convex/server";

export const decompressAndSave = internalAction({
    args: v.object({
        storageId: v.id("_storage"),
    }),
    handler: async (ctx, { storageId }) => {
        const zipBlob = await ctx.storage.get(storageId);
        const zip = new Uint8Array(await zipBlob?.arrayBuffer()!);
        const decompressed = unzipSync(zip, {
            filter: (file) => file.name.includes(".json"),
        });

        const storageIds: Id<"_storage">[] = [];

        for (const [fileName, fileData] of Object.entries(decompressed)) {
            const jsonStr = strFromU8(fileData);
            const blob = new Blob([jsonStr], { type: "application/json" });
            const newStorageId = await ctx.storage.store(blob);

            storageIds.push(newStorageId);
        }

        return storageIds;
    },
});
