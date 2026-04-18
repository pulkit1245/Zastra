package com.pulkit.ZastraBackend.dto.response;

public record NotificationResponse(
        String id,
        String message,
        boolean isRead,
        String createdAt   // ISO-8601
) {}
