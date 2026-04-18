package com.pulkit.ZastraBackend.controller;

import com.pulkit.ZastraBackend.dto.response.GamificationSummaryResponse;
import com.pulkit.ZastraBackend.dto.response.LeaderboardEntry;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.service.GamificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/summary")
    public ResponseEntity<GamificationSummaryResponse> getSummary(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(gamificationService.getGamificationSummary(user.getId()));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntry>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }
}
