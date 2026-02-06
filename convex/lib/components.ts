import { Workpool } from "@convex-dev/workpool";

import { components } from "@/convex/api";

// export const counter = new ShardedCounter(components.shardedCounter);

// export const workflow = new WorkflowManager(components.workflow);

export const analysisWorkpool = new Workpool(components.analysisWorkpool, {
    maxParallelism: 1,
});

export const spotifyAddWorkpool = new Workpool(components.spotifyAddWorkpool, {
    maxParallelism: 1,
});
