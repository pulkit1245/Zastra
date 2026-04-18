package com.pulkit.ZastraBackend.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ProjectRequest(
        @NotBlank String title,
        String description,
        List<String> techStack,
        String link
) {}
