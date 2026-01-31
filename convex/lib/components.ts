import { ShardedCounter } from "@convex-dev/sharded-counter";
import { WorkflowManager } from "@convex-dev/workflow";
import { Workpool } from "@convex-dev/workpool";

import { components } from "@/convex/api";

export const counter = new ShardedCounter(components.shardedCounter);

export const workflow = new WorkflowManager(components.workflow);

export const analysisItemWorkpool = new Workpool(
    components.analysisItemWorkpool,
    {
        maxParallelism: 1,
    },
);
export const analysisItemDispatchWorkpool = new Workpool(
    components.analysisItemDispatchWorkpool,
    {
        maxParallelism: 1,
    },
);

export const analysisFileWorkpool = new Workpool(
    components.analysisFileWorkpool,
    {
        maxParallelism: 1,
    },
);
