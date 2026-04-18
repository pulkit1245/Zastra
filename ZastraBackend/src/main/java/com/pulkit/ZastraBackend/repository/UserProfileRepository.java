package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUser(User user);
    Optional<UserProfile> findByUserId(UUID userId);
}
