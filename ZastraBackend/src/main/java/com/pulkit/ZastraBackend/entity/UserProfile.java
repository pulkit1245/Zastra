package com.pulkit.ZastraBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_profile_target_roles",
            joinColumns = @JoinColumn(name = "user_profile_id")
    )
    @Column(name = "role")
    @Builder.Default
    private List<String> targetRoles = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    private Instant updatedAt;

    @PrePersist
    void onPersist() {
        if (createdAt == null) createdAt = Instant.now();
        if (updatedAt == null) updatedAt = Instant.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
