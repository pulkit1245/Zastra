package com.pulkit.ZastraBackend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SyncRequest(@NotBlank String username) {}
