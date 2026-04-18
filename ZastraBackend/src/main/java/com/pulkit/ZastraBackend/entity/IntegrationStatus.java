package com.pulkit.ZastraBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
        name = "integration_statuses",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "platform"})
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String platform;

    private String platformUsername;

    @Column(nullable = false)
    @Builder.Default
    private String status = "NEVER_SYNCED";

    private Instant lastSynced;
}
