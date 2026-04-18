package com.pulkit.ZastraBackend.controller;

import com.pulkit.ZastraBackend.dto.response.ContestStatsResponse;
import com.pulkit.ZastraBackend.dto.response.GithubStatsResponse;
import com.pulkit.ZastraBackend.dto.response.GlobalStatsResponse;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.service.ActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/activity")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/global")
    public ResponseEntity<GlobalStatsResponse> getGlobalStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(activityService.getGlobalStats(user.getId()));
    }

    @GetMapping("/github")
    public ResponseEntity<GithubStatsResponse> getGithubStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(activityService.getGithubStats(user.getId()));
    }

    @GetMapping("/contest")
    public ResponseEntity<ContestStatsResponse> getContestStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(activityService.getContestStats(user.getId()));
    }
}
