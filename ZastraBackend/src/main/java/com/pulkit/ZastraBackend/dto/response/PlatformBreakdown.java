package com.pulkit.ZastraBackend.dto.response;

/** Per-platform difficulty breakdown used inside GlobalStatsResponse. */
public record PlatformBreakdown(
        DifficultyBreakdown leetcode,
        DifficultyBreakdown codeforces
) {}
