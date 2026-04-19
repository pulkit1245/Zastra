package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.request.ProjectRequest;
import com.pulkit.ZastraBackend.dto.response.ProjectResponse;
import com.pulkit.ZastraBackend.entity.Project;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.ProjectRepository;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(UUID userId, ProjectRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Project project = Project.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .techStack(request.techStack() != null ? request.techStack() : List.of())
                .link(request.link())
                .build();

        projectRepository.save(project);
        return mapToResponse(project);
    }

    @Transactional
    public ProjectResponse updateProject(UUID projectId, UUID userId, ProjectRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this project");
        }

        project.setTitle(request.title());
        project.setDescription(request.description());
        if (request.techStack() != null) {
            project.setTechStack(request.techStack());
        }
        project.setLink(request.link());

        projectRepository.save(project);
        return mapToResponse(project);
    }

    @Transactional
    public void deleteProject(UUID projectId, UUID userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        if (!project.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this project");
        }

        projectRepository.delete(project);
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getProjects(UUID userId) {
        // userId could be fetched from ProjectRepository.findByUserId
        return projectRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
                project.getId().toString(),
                project.getTitle(),
                project.getDescription(),
                project.getTechStack(),
                project.getLink(),
                project.getCreatedAt() != null ? project.getCreatedAt().toString() : null
        );
    }
}
