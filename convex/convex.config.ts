import workpool from "@convex-dev/workpool/convex.config.js";
import { defineApp } from "convex/server";

const app = defineApp();

// app.use(counter);
// app.use(workflow);
app.use(workpool, { name: "analysisWorkpool" });
app.use(workpool, { name: "spotifyAddWorkpool" });

export default app;
