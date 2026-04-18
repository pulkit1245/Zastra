package com.pulkit.ZastraBackend.dto.response;

import java.util.List;

public record ProfileResponse(
        String displayName,
        String bio,
        List<String> targetRoles
) {}
