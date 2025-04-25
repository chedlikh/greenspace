package com.example.app.Service;

import com.example.app.Entities.NotificationSondage;
import com.example.app.Entities.Sondage;
import com.example.app.Entities.User;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface INotificationService {


    void createSondageNotification(String username, String message, String type, Long sondageId);

    void createSondageNotification(Long userId, String message, String type, Long sondageId);

    @Transactional(readOnly = true)
    List<NotificationSondage> getUnreadNotifications(String username);

    void markAsRead(Long notificationId);

    void markAllAsRead(String username);
}
