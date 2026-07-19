export type SpotifyEligibilityReason =
    | "eligible"
    | "not_connected"
    | "not_whitelisted"
    | "missing_scope"
    | "spotify_unavailable";

export function classifySpotifyEligibility({
    hasToken,
    hasPlaylistScope,
    spotifyStatus,
}: {
    hasToken: boolean;
    hasPlaylistScope: boolean;
    spotifyStatus?: number;
}): {
    canCreatePlaylist: boolean;
    reason: SpotifyEligibilityReason;
} {
    if (!hasToken) {
        return { canCreatePlaylist: false, reason: "not_connected" };
    }
    if (!hasPlaylistScope) {
        return { canCreatePlaylist: false, reason: "missing_scope" };
    }
    if (spotifyStatus === 403) {
        return { canCreatePlaylist: false, reason: "not_whitelisted" };
    }
    if (spotifyStatus && spotifyStatus >= 200 && spotifyStatus < 300) {
        return { canCreatePlaylist: true, reason: "eligible" };
    }
    return { canCreatePlaylist: false, reason: "spotify_unavailable" };
}
