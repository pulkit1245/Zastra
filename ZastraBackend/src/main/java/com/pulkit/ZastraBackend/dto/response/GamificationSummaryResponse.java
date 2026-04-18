package com.pulkit.ZastraBackend.dto.response;

public record GamificationSummaryResponse(
        String currentLevel,
        int totalXp,
        int nextLevelXp
) {}
