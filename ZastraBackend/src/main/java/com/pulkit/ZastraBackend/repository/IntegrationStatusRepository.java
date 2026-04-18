package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.IntegrationStatus;
import com.pulkit.ZastraBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IntegrationStatusRepository extends JpaRepository<IntegrationStatus, UUID> {
    List<IntegrationStatus> findByUser(User user);
    Optional<IntegrationStatus> findByUserAndPlatform(User user, String platform);
}
