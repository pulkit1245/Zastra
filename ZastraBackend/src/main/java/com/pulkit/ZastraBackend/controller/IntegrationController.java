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

        SyncResponse resp = integrationService.syncPlatform(user.getId(), platform, provided);

        // Refresh cached activity data for the user so UI shows updated overall stats
        // This will invalidate cache and fetch fresh data from scrapers.
        try {
            activityService.syncAll(user.getId());
        } catch (Exception ignored) {
            // swallow exceptions to avoid failing the sync endpoint if scrapers have issues
        }

        return ResponseEntity.ok(resp);
    }

    @PostMapping("/sync-all")
    public ResponseEntity<SyncResponse> syncAll(@AuthenticationPrincipal User user) {
        activityService.syncAll(user.getId());
        return ResponseEntity.ok(new SyncResponse("All platforms synchronized successfully", "SUCCESS"));
    }
}
