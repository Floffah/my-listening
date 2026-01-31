import counter from "@convex-dev/sharded-counter/convex.config.js";
import workflow from "@convex-dev/workflow/convex.config.js";
import workpool from "@convex-dev/workpool/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();

app.use(counter);
app.use(workflow);
app.use(workpool, { name: "analysisItemWorkpool" });
app.use(workpool, { name: "analysisFileWorkpool" });
app.use(workpool, { name: "analysisItemDispatchWorkpool" });

export default app;
