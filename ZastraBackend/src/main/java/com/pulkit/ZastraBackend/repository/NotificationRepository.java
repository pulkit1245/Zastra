package com.pulkit.ZastraBackend.repository;

import com.pulkit.ZastraBackend.entity.Notification;
import com.pulkit.ZastraBackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
