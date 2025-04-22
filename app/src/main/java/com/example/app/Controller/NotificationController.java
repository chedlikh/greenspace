package com.example.app.Controller;

import com.example.app.Entities.NotificationSondage;
import com.example.app.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationSondage>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PutMapping("/{notificationId}/mark-as-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mark-all-read/{userId}")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/test-notification")

    public ResponseEntity<Map<String, String>> sendTestNotification(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        String message = (String) payload.get("message");
        String type = (String) payload.get("type");
        Long sondageId = payload.get("sondageId") != null ?
                Long.valueOf(payload.get("sondageId").toString()) : null;

        notificationService.createSondageNotification(userId, message, type, sondageId);

        return ResponseEntity.ok(Map.of("status", "Notification sent successfully"));
    }
}