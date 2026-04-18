package com.pulkit.ZastraBackend.dto.response;

/** A single past contest entry inside ContestStatsResponse. */
public record ContestHistoryEntry(
        String platform,
        String contestName,
        int rank,
        String date   // "yyyy-MM-dd"
) {}
