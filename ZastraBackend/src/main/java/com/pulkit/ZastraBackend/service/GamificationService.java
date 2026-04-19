package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.response.*;
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

    @Transactional
    public void updateXpFromStats(UUID userId, GlobalStatsResponse global, GithubStatsResponse github, ContestStatsResponse contests) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        GamificationProfile profile = gamificationRepository.findByUser(user)
                .orElseGet(() -> {
                    GamificationProfile newProfile = new GamificationProfile();
                    newProfile.setUser(user);
                    newProfile.setTotalXp(0);
                    newProfile.setCurrentLevel("Code Newbie");
                    return newProfile;
                });

        int totalXp = 0;

        // 1. Solving Problems (Difficulty based)
        if (global != null && global.difficulty() != null) {
            totalXp += global.difficulty().easy() * 10;
            totalXp += global.difficulty().medium() * 30;
            totalXp += global.difficulty().hard() * 100;
        }

        // 2. GitHub Activity
        if (github != null) {
            totalXp += github.totalRepos() * 50;
            totalXp += github.totalStars() * 10;
            totalXp += github.commitsLastYear() * 2;
        }

        // 3. Competitive Programming
        if (contests != null) {
            totalXp += contests.totalContests() * 100;
        }

        profile.setTotalXp(totalXp);
        profile.setCurrentLevel(calculateLevelName(totalXp));
        
        gamificationRepository.save(profile);
    }

    private String calculateLevelName(int xp) {
        if (xp < 1000) return "Code Newbie";
        if (xp < 5000) return "Apprentice Developer";
        if (xp < 15000) return "Senior Engineer";
        if (xp < 30000) return "Master Architect";
        return "Coding Legend";
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
                        "Zastra Master" // Title for leaderboard
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
