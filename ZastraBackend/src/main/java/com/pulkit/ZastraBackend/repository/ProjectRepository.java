package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.Project;
import com.pulkit.ZastraBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    List<Project> findByUser(User user);
    List<Project> findByUserId(UUID userId);
}
