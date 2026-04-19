package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.response.GamificationSummaryResponse;
import com.pulkit.ZastraBackend.dto.response.LeaderboardEntry;
import com.pulkit.ZastraBackend.entity.GamificationProfile;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.GamificationRepository;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private final GamificationRepository gamificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public GamificationSummaryResponse getGamificationSummary(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GamificationProfile profile = gamificationRepository.findByUser(user)
                .orElseGet(() -> {
                    // Return a default if not found
                    GamificationProfile defaultProfile = new GamificationProfile();
                    defaultProfile.setTotalXp(0);
                    defaultProfile.setCurrentLevel("Code Newbie");
                    return defaultProfile;
                });

        int nextLevelXp = calculateNextLevelXp(profile.getTotalXp());

        return new GamificationSummaryResponse(
                profile.getCurrentLevel(),
                profile.getTotalXp(),
                nextLevelXp
        );
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard() {
        List<GamificationProfile> topProfiles = gamificationRepository.findTop10ByOrderByTotalXpDesc();

        java.util.concurrent.atomic.AtomicInteger rank = new java.util.concurrent.atomic.AtomicInteger(1);
        return topProfiles.stream().map(profile ->
                new LeaderboardEntry(
                        rank.getAndIncrement(),
                        // Username or email as fallback
                        profile.getUser().getUsername() != null ? profile.getUser().getUsername()
                                : profile.getUser().getEmail().split("@")[0],
                        profile.getTotalXp(),
                        "Java" // Hardcoded top language for MVP
                )
        ).collect(Collectors.toList());
    }

    private int calculateNextLevelXp(int currentXp) {
        if (currentXp < 1000) return 1000;
        if (currentXp < 5000) return 5000;
        if (currentXp < 10000) return 10000;
        return currentXp + 5000; // Generic formula for MVP
    }
}
