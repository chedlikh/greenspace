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

    @GetMapping("/user/{username}")  // Changed from userId to username
    public ResponseEntity<List<NotificationSondage>> getUnreadNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(username));
    }

    @PutMapping("/{notificationId}/mark-as-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notificationId) {
        notificationService.markAsRead(notificationId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/mark-all-read/{username}")  // Changed from userId to username
    public ResponseEntity<Void> markAllAsRead(@PathVariable String username) {
        notificationService.markAllAsRead(username);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test-notification")
    public ResponseEntity<Map<String, String>> sendTestNotification(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");  // Changed from userId
        String message = (String) payload.get("message");
        String type = (String) payload.get("type");
        Long sondageId = payload.get("sondageId") != null ?
                Long.valueOf(payload.get("sondageId").toString()) : null;

        notificationService.createSondageNotification(username, message, type, sondageId);

        return ResponseEntity.ok(Map.of("status", "Notification sent successfully"));
    }

}