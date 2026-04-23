package com.pulkit.ZastraBackend.dto.response;

public record IntegrationStatusResponse(
        String platform,
        String status,
        String lastSynced,  // ISO-8601 string or null
        String platformUsername
) {}
