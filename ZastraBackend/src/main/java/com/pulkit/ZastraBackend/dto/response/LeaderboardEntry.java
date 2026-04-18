package com.pulkit.ZastraBackend.dto.response;

/** A single leaderboard row. */
public record LeaderboardEntry(
        int rank,
        String username,
        int xp,
        String topLanguage
) {}
