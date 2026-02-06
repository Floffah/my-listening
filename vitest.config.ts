import { defineConfig } from "vitest/config";

// this is only for testing convex functions, regular tests are using bun

export default defineConfig({
    test: {
        environment: "edge-runtime",
        server: { deps: { inline: ["convex-test"] } },
        dir: "convex",
    },
});
