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
            @Valid @RequestBody SyncRequest request) {
        return ResponseEntity.ok(integrationService.syncPlatform(user.getId(), platform, request));
    }

    @PostMapping("/sync-all")
    public ResponseEntity<SyncResponse> syncAll(@AuthenticationPrincipal User user) {
        activityService.syncAll(user.getId());
        return ResponseEntity.ok(new SyncResponse("All platforms synchronized successfully", "SUCCESS"));
    }
}
