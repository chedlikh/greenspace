package com.example.app.Service;

import com.example.app.Entities.NotificationSondage;
import com.example.app.Entities.User;

import com.example.app.Repository.NotificationSondageRepo;
import com.example.app.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class NotificationService implements INotificationService {

    private final NotificationSondageRepo notificationRepository;
    private final UserRepo userRepo;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(NotificationSondageRepo notificationRepository,
                               UserRepo userRepo,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userRepo = userRepo;
        this.messagingTemplate = messagingTemplate;
    }
    @Override
    public NotificationSondage createNotification(NotificationSondage notification) {
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRead(false);
        NotificationSondage savedNotification = notificationRepository.save(notification);

        // Send real-time notification via WebSocket
        if (notification.getRecipient() != null) {
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipient().getUsername(),
                    "/queue/notifications-update",
                    Map.of(
                            "type", "new-notification",
                            "notification", savedNotification
                    )
            );
        }

        return savedNotification;
    }

    @Override
    public void createSondageNotification(Long userId, String message, String type, Long sondageId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        NotificationSondage notification = new NotificationSondage();
        notification.setMessage(message);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        notification.setRecipient(user);

        notification = notificationRepository.save(notification);

        // Send notification via WebSocket
        messagingTemplate.convertAndSendToUser(
                user.getUsername(),
                "/queue/notifications-update",
                Map.of(
                        "type", "new-notification",
                        "notification", notification
                )
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationSondage> getUnreadNotifications(Long userId) {
        return notificationRepository.findByRecipientIdAndIsReadFalse(userId);
    }

    @Override
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
    @Override
    public void markAllAsRead(Long userId) {
        List<NotificationSondage> unreadNotifications = getUnreadNotifications(userId);
        unreadNotifications.forEach(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }
}