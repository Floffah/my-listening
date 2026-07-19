"use node";

import { v } from "convex/values";
import { Buffer } from "node:buffer";
import { fromBufferPromise } from "yauzl";

import { Id } from "@/convex/dataModel";
import { internalAction } from "@/convex/server";

const MAX_JSON_FILE_SIZE = 32 * 1024 * 1024;

export async function* jsonFilesFromZip(zipBuffer: Buffer) {
    const zipFile = await fromBufferPromise(zipBuffer, {
        lazyEntries: true,
        validateEntrySizes: true,
    });

    try {
        for await (const entry of zipFile.eachEntry()) {
            if (!entry.fileName.toLowerCase().endsWith(".json")) {
                continue;
            }
            if (entry.uncompressedSize > MAX_JSON_FILE_SIZE) {
                throw new Error(`${entry.fileName} is too large to process`);
            }

            const stream = await zipFile.openReadStreamPromise(entry);
            const parts: ArrayBuffer[] = [];

            for await (const chunk of stream) {
                const bytes = new Uint8Array((chunk as Buffer).byteLength);
                bytes.set(chunk as Buffer);
                parts.push(bytes.buffer);
            }

            yield new Blob(parts, { type: "application/json" });
        }
    } finally {
        if (zipFile.isOpen) {
            zipFile.close();
        }
    }
}

export const decompressAndSave = internalAction({
    args: v.object({
        storageId: v.id("_storage"),
    }),
    handler: async (ctx, { storageId }) => {
        const zipBlob = await ctx.storage.get(storageId);
        if (!zipBlob) {
            throw new Error("The uploaded ZIP could not be found");
        }

        const storageIds: Id<"_storage">[] = [];

        for await (const blob of jsonFilesFromZip(
            Buffer.from(await zipBlob.arrayBuffer()),
        )) {
            const newStorageId = await ctx.storage.store(blob);
            storageIds.push(newStorageId);
        }

        if (storageIds.length === 0) {
            throw new Error("The ZIP does not contain any JSON files");
        }

        return storageIds;
    },
});
