package com.pulkit.ZastraBackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Field named "read" so Lombok generates isRead() / setRead()
     * which maps cleanly to the JSON key "isRead" via the DTO record.
     */
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean read = false;

    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void onPersist() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
