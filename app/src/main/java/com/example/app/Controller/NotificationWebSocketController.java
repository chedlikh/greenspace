package com.example.app.Controller;
import com.example.app.Entities.NotificationSondage;
import com.example.app.Entities.User;
import com.example.app.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Controller
public class NotificationWebSocketController {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationWebSocketController(NotificationService notificationService,
                                           SimpMessagingTemplate messagingTemplate) {
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/notifications.mark-read")
    public void markNotificationAsRead(@Payload Long notificationId, Principal principal) {
        notificationService.markAsRead(notificationId);

        // Get username directly from principal
        String username = principal.getName();
        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications-update",
                Map.of("type", "marked-read", "notificationId", notificationId)
        );
    }

    @MessageMapping("/notifications.mark-all-read")
    public void markAllNotificationsAsRead(Principal principal) {
        String username = principal.getName();
        notificationService.markAllAsRead(username);

        messagingTemplate.convertAndSendToUser(
                username,
                "/queue/notifications-update",
                Map.of("type", "marked-all-read")
        );
    }

    @SubscribeMapping("/user/queue/notifications")
    public List<NotificationSondage> getInitialNotifications(Principal principal) {
        String username = principal.getName();
        return notificationService.getUnreadNotifications(username);
    }
}