package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.response.*;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final ProfileService profileService;
    private final ProjectService projectService;
    private final ActivityService activityService;
    private final GamificationService gamificationService;

    @Transactional(readOnly = true)
    public PortfolioPublicResponse getPublicPortfolio(String username) {
        // Fallback for user.getUsername() since in AuthService MVP we didn't force username uniqueness properly
        User user = userRepository.findByUsername(username).orElseGet(() -> 
                userRepository.findByEmail(username).orElseThrow(() -> new RuntimeException("User not found: " + username)));

        ProfileResponse profile = profileService.getProfile(user.getId());
        List<ProjectResponse> projects = projectService.getProjects(user.getId());
        GlobalStatsResponse globalStats = activityService.getGlobalStats(user.getId());
        GithubStatsResponse githubStats = activityService.getGithubStats(user.getId());
        GamificationSummaryResponse gamificationSummary = gamificationService.getGamificationSummary(user.getId());

        return new PortfolioPublicResponse(
                profile,
                globalStats,
                githubStats,
                Map.of("Java", 80, "Python", 60), // mock
                projects,
                "Strong analytical skills with a focus on backend performance.", // mock AI summary
                new GamificationLevelInfo(gamificationSummary.currentLevel())
        );
    }

    @Transactional(readOnly = true)
    public List<PortfolioDirectoryEntry> getDirectory() {
        return userRepository.findAll().stream().map(user -> {
            ProfileResponse profile = profileService.getProfile(user.getId());
            GlobalStatsResponse stats = activityService.getGlobalStats(user.getId());
            String username = user.getUsername() != null ? user.getUsername() : user.getEmail();
            String title = (profile.targetRoles() != null && !profile.targetRoles().isEmpty())
                    ? profile.targetRoles().get(0)
                    : "Developer";

            return new PortfolioDirectoryEntry(
                    username,
                    profile.displayName() != null ? profile.displayName() : username,
                    title,
                    stats.totalSolved()
            );
        }).collect(Collectors.toList());
    }
}
