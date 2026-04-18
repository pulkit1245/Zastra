package com.pulkit.ZastraBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

/**
 * Stores JSON-serialised activity snapshots fetched from external platforms.
 * Populated (and refreshed) by async sync jobs triggered via Kafka.
 */
@Entity
@Table(name = "cached_activity_data")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CachedActivityData {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT")
    private String globalStatsJson;

    @Column(columnDefinition = "TEXT")
    private String githubStatsJson;

    @Column(columnDefinition = "TEXT")
    private String contestStatsJson;

    @Column(columnDefinition = "TEXT")
    private String topicsJson;

    @Column(columnDefinition = "TEXT")
    private String heatmapJson;

    @Column(nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onPersist() {
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
