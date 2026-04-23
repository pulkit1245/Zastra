package com.pulkit.ZastraBackend.controller;

import com.pulkit.ZastraBackend.dto.request.SyncRequest;
import com.pulkit.ZastraBackend.dto.response.IntegrationStatusResponse;
import com.pulkit.ZastraBackend.dto.response.SyncResponse;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.service.ActivityService;
import com.pulkit.ZastraBackend.service.IntegrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/integrations")
@RequiredArgsConstructor
public class IntegrationController {

    private final IntegrationService integrationService;
    private final ActivityService activityService;

    @GetMapping
    public ResponseEntity<List<IntegrationStatusResponse>> getIntegrationStatuses(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(integrationService.getIntegrationStatuses(user.getId()));
    }

    @PostMapping("/{platform}/sync")
    public ResponseEntity<SyncResponse> syncPlatform(
            @AuthenticationPrincipal User user,
            @PathVariable String platform,
            @RequestBody(required = false) SyncRequest request,
            @RequestParam(required = false) String username) {

        // Prefer JSON body, fall back to query param if provided
        String provided = null;
        if (request != null) provided = request.username();
        if ((provided == null || provided.isBlank()) && username != null && !username.isBlank()) provided = username;

        if (provided == null || provided.isBlank()) {
            return ResponseEntity.badRequest().body(new SyncResponse("username is required", "ERROR"));
        }
        System.out.println("[IntegrationController] sync request for platform=" + platform + " username=" + provided + " userId=" + user.getId());

        // 1. Save the username immediately (fast DB write)
        SyncResponse resp = integrationService.syncPlatform(user.getId(), platform, provided);

        // 2. Kick off the full scrape in the background — don't block the HTTP response
        final UUID userId = user.getId();
        CompletableFuture.runAsync(() -> {
            try {
                activityService.syncAll(userId);
            } catch (Exception e) {
                System.err.println("[IntegrationController] background syncAll failed: " + e.getMessage());
            }
        });

        // 3. Return immediately — frontend polls for updated data
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/sync-all")
    public ResponseEntity<SyncResponse> syncAll(@AuthenticationPrincipal User user) {
        // Also fire async so the endpoint returns quickly
        final UUID userId = user.getId();
        CompletableFuture.runAsync(() -> {
            try {
                activityService.syncAll(userId);
            } catch (Exception e) {
                System.err.println("[IntegrationController] background syncAll failed: " + e.getMessage());
            }
        });
        return ResponseEntity.ok(new SyncResponse("Sync started in background", "PENDING"));
    }
}
