package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.request.SyncRequest;
import com.pulkit.ZastraBackend.dto.response.IntegrationStatusResponse;
import com.pulkit.ZastraBackend.dto.response.SyncResponse;
import com.pulkit.ZastraBackend.entity.IntegrationStatus;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.IntegrationStatusRepository;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IntegrationService {

    private final IntegrationStatusRepository integrationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<IntegrationStatusResponse> getIntegrationStatuses(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return integrationRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SyncResponse syncPlatform(UUID userId, String platform, SyncRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        IntegrationStatus status = integrationRepository.findByUserAndPlatform(user, platform)
                .orElse(IntegrationStatus.builder()
                        .user(user)
                        .platform(platform)
                        .status("NEVER_SYNCED")
                        .build());

        status.setPlatformUsername(request.username());
        status.setStatus("SYNCED");
        status.setLastSynced(Instant.now());

        integrationRepository.save(status);

        return new SyncResponse("Successfully synced with " + platform, "SUCCESS");
    }

    private IntegrationStatusResponse mapToResponse(IntegrationStatus status) {
        return new IntegrationStatusResponse(
                status.getPlatform(),
                status.getStatus(),
                status.getLastSynced() != null ? status.getLastSynced().toString() : null
        );
    }
}
