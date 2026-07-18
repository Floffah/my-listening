type SongAggregate = {
    spotifyId: string;
    timesPlayed: number;
    firstPlayed: number;
};

export function mergeSongAggregates(songs: readonly SongAggregate[]) {
    const merged = new Map<string, Omit<SongAggregate, "spotifyId">>();

    for (const song of songs) {
        const existing = merged.get(song.spotifyId);
        if (existing) {
            existing.timesPlayed += song.timesPlayed;
            existing.firstPlayed = Math.min(
                existing.firstPlayed,
                song.firstPlayed,
            );
        } else {
            merged.set(song.spotifyId, {
                timesPlayed: song.timesPlayed,
                firstPlayed: song.firstPlayed,
            });
        }
    }

    return merged;
}
