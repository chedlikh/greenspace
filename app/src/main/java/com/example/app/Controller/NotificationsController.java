package com.example.app.Controller;

import com.example.app.DTOs.NotificationDTO;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.NotificationServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationsController {

    @Autowired
    private NotificationServices notificationService;
    @Autowired
    private UserRepo userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications() {
        Long userId = getCurrentUserId();
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications() {
        return ResponseEntity.ok(notificationService.getUserNotifications(getCurrentUserId()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id) {
        notificationService.markNotificationAsRead(id, getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead() {
        notificationService.markAllNotificationsAsRead(getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences")
    public ResponseEntity<Void> updateNotificationPreferences(@RequestBody Map<String, Object> preferences) {
        notificationService.updateNotificationPreferences(getCurrentUserId(), preferences);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<Object> getUserNotificationPreferences() {
        return ResponseEntity.ok(notificationService.getUserNotificationPreferences(getCurrentUserId()));
    }

    @PostMapping("/device")
    public ResponseEntity<Void> registerDeviceToken(
            @RequestBody Map<String, String> deviceInfo
    ) {
        notificationService.registerDeviceToken(
                getCurrentUserId(),
                deviceInfo.get("deviceToken"),
                deviceInfo.get("platform")
        );
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/device/{deviceToken}")
    public ResponseEntity<Void> unregisterDeviceToken(@PathVariable String deviceToken) {
        notificationService.unregisterDeviceToken(getCurrentUserId(), deviceToken);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/device")
    public ResponseEntity<List<String>> getUserDeviceTokens() {
        return ResponseEntity.ok(notificationService.getUserDeviceTokens(getCurrentUserId()));
    }
}