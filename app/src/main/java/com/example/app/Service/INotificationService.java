package com.example.app.Service;

import com.example.app.Entities.NotificationSondage;
import com.example.app.Entities.Sondage;
import com.example.app.Entities.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface INotificationService {


    NotificationSondage createNotification(NotificationSondage notification);
    void createSondageNotification(Long userId, String message, String type, Long sondageId);
    List<NotificationSondage> getUnreadNotifications(Long userId);
    void markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
}
