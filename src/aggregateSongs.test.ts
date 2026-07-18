import { expect, test } from "bun:test";

import { mergeSongAggregates } from "../convex/lib/aggregateSongs";

test("merges duplicate per-file song aggregates", () => {
    expect([
        ...mergeSongAggregates([
            { spotifyId: "a", timesPlayed: 4, firstPlayed: 200 },
            { spotifyId: "b", timesPlayed: 3, firstPlayed: 300 },
            { spotifyId: "a", timesPlayed: 7, firstPlayed: 100 },
        ]),
    ]).toEqual([
        ["a", { timesPlayed: 11, firstPlayed: 100 }],
        ["b", { timesPlayed: 3, firstPlayed: 300 }],
    ]);
});
