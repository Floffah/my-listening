import { expect, test } from "bun:test";

import { canStartAnalysis } from "../convex/upload";

test("failed analyses can restart without allowing duplicate active runs", () => {
    expect(canStartAnalysis(undefined)).toBe(true);
    expect(canStartAnalysis("not_started")).toBe(true);
    expect(canStartAnalysis("failed")).toBe(true);
    expect(canStartAnalysis("in_progress")).toBe(false);
    expect(canStartAnalysis("completed")).toBe(false);
});
