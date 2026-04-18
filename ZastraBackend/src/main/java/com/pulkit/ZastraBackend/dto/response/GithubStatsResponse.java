package com.pulkit.ZastraBackend.dto.response;

import java.util.List;

public record GithubStatsResponse(
        int commitsLastYear,
        int totalRepos,
        int totalStars,
        List<String> topLanguages
) {}
