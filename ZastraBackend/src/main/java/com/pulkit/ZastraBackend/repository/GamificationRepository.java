package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.GamificationProfile;
import com.pulkit.ZastraBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GamificationRepository extends JpaRepository<GamificationProfile, UUID> {
    Optional<GamificationProfile> findByUser(User user);
    /** Leaderboard top-10 by XP descending. */
    List<GamificationProfile> findTop10ByOrderByTotalXpDesc();
}
