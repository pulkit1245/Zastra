package com.pulkit.ZastraBackend.dto.response;

/** Ratings grouped by platform inside ContestStatsResponse. */
public record ContestRatings(ContestRating leetcode, ContestRating codeforces) {}
