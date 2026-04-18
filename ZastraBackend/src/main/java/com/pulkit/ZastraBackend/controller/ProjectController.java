package com.pulkit.ZastraBackend.controller;

import com.pulkit.ZastraBackend.dto.request.ProjectRequest;
import com.pulkit.ZastraBackend.dto.response.ProjectResponse;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.service.ProjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.createProject(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(projectService.getProjects(user.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest request) {
        return ResponseEntity.ok(projectService.updateProject(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        projectService.deleteProject(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
