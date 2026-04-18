package com.pulkit.ZastraBackend.dto.response;

import java.util.List;
import java.util.Map;

/**
 * Master payload for the public shareable portfolio page.
 * Returned by GET /api/v1/portfolio/public/{username}
 */
public record PortfolioPublicResponse(
        ProfileResponse profile,
        GlobalStatsResponse globalStats,
        GithubStatsResponse github,
        Map<String, Integer> topics,
        List<ProjectResponse> manualProjects,
        String aiSummary,
        GamificationLevelInfo gamification
) {}
