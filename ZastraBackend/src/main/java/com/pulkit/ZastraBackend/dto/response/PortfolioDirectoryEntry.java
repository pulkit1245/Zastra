package com.pulkit.ZastraBackend.dto.response;

/** A row in the public developer directory listing. */
public record PortfolioDirectoryEntry(
        String username,
        String displayName,
        String title,
        int totalSolved
) {}
