package com.example.app.Service;

import com.example.app.DTOs.CallDTO;
import com.example.app.DTOs.ConversationDTO;
import com.example.app.DTOs.MessageDTO;
import com.example.app.DTOs.NotificationDTO;

import java.util.List;

public interface NotificationServices {
    void sendNewMessageNotification(Long userId, MessageDTO message);
    void sendCallNotification(Long userId, CallDTO call);
    void createInAppNotification(Long userId, String type, String title, String content, Object data);
    void sendMissedCallNotification(Long userId, CallDTO call);
    void sendGroupUpdateNotification(List<Long> userIds, ConversationDTO conversation, String updateType);
    void sendEmailNotification(Long userId, String subject, String body);
    void sendMissedMessagesEmail(Long userId, List<MessageDTO> messages);
    List<NotificationDTO> getUserNotifications(Long userId);
    void markNotificationAsRead(Long notificationId, Long userId);
    void markAllNotificationsAsRead(Long userId);
    void updateNotificationPreferences(Long userId, Object preferences);
    Object getUserNotificationPreferences(Long userId);
    boolean shouldSendNotification(Long userId, String notificationType);
    void sendBulkNotifications(List<Long> userIds, String type, Object data);
    void scheduleNotification(Long userId, String type, Object data, long delayInMillis);
    void registerDeviceToken(Long userId, String deviceToken, String platform);
    void unregisterDeviceToken(Long userId, String deviceToken);
    List<NotificationDTO> getUnreadNotifications(Long userId);
    List<String> getUserDeviceTokens(Long userId);
}
