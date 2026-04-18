package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.CachedActivityData;
import com.pulkit.ZastraBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CachedActivityDataRepository extends JpaRepository<CachedActivityData, UUID> {
    Optional<CachedActivityData> findByUser(User user);
    Optional<CachedActivityData> findByUserId(UUID userId);
}
