package com.pulkit.ZastraBackend.dto.response;

public record GlobalStatsResponse(
        int totalSolved,
        int totalActiveDays,
        DifficultyBreakdown difficulty,
        PlatformBreakdown platformBreakdown
) {}
