import { $ } from "bun";

await Promise.all([$`vitest`, $`bun test --watch`]);
