package com.pulkit.ZastraBackend.dto.response;

import java.util.List;

public record ProjectResponse(
        String id,
        String title,
        String description,
        List<String> techStack,
        String link,
        String createdAt   // ISO-8601
) {}
