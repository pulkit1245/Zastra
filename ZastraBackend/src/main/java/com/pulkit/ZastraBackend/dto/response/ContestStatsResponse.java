package com.pulkit.ZastraBackend.dto.response;

import java.util.List;

public record ContestStatsResponse(
        int totalContests,
        ContestRatings ratings,
        List<ContestHistoryEntry> history
) {}
