package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import com.example.app.Mappers.NotificationMapper;
import com.example.app.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationServices {
    private static final Logger logger = Logger.getLogger(NotificationServiceImpl.class.getName());

    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private NotificationMapper notificationMapper;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final Map<Long, Map<String, Object>> notificationPreferences = new ConcurrentHashMap<>();
    private final Map<Long, List<String>> deviceTokens = new ConcurrentHashMap<>();

    @Override
    public void sendNewMessageNotification(Long userId, MessageDTO message) {
        if (shouldSendNotification(userId, "MESSAGE")) {
            String senderUsername = message.getSender() != null ? message.getSender().getUsername() : "Anonymous";
            createInAppNotification(
                    userId,
                    "MESSAGE",
                    "New Message",
                    "New message from " + senderUsername,
                    message
            );
        }
    }

    @Override
    public void sendCallNotification(Long userId, CallDTO call) {
        if (shouldSendNotification(userId, "CALL")) {
            if (call == null || call.getInitiatedBy() == null) {
                logger.severe("Invalid call or initiatedBy for userId: " + userId);
                return;
            }

            logger.info("Preparing call notification for userId: " + userId + ", callId: " + call.getId());

            String initiatorUsername = call.getInitiatedBy().getUsername() != null ?
                    call.getInitiatedBy().getUsername() : "Anonymous";
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("callId", call.getId());
            metadata.put("initiatorId", call.getInitiatedBy().getId());
            metadata.put("conversationId", call.getConversationId());
            metadata.put("type", call.getType()); // Ajout du type d'appel

            Notification notification = new Notification();
            notification.setUser(userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId)));
            notification.setType("CALL");
            notification.setTitle("Incoming Call");
            notification.setContent("Call from " + initiatorUsername);
            notification.setCreatedDate(LocalDateTime.now());
            notification.setRead(false);
            notification.setCallId(call.getId().toString());
            notification.setConversationId(call.getConversationId().toString());
            notification.setMetadataMap(metadata);
            notification = notificationRepository.save(notification);

            logger.info("Call notification created in database with ID: " + notification.getId());
            logger.info("Call notification metadata: " + metadata);

            NotificationDTO notificationDTO = notificationMapper.toDto(notification);

            try {
                // Envoi à /queue/notifications (pour la compatibilité)
                messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        "/queue/notifications",
                        notificationDTO
                );

                // Envoi également à /queue/call (pour déclencher le CallModal)
                messagingTemplate.convertAndSendToUser(
                        userId.toString(),
                        "/queue/call",
                        call  // Utiliser le CallDTO, pas notificationDTO
                );

                logger.info("Sent call notification to userId: " + userId +
                        " at /user/" + userId + "/queue/notifications and /user/" + userId + "/queue/call");
            } catch (Exception e) {
                logger.severe("Failed to send call notification to userId: " + userId + ": " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @Override
    public void createInAppNotification(Long userId, String type, String title, String content, Object data) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setCreatedDate(LocalDateTime.now());
        notification.setRead(false);

        Map<String, Object> metadata = new HashMap<>();
        if (data instanceof MessageDTO message) {
            notification.setConversationId(message.getConversationId().toString());
            metadata.put("conversationId", message.getConversationId());
        } else if (data instanceof CallDTO call) {
            if (call.getInitiatedBy() != null) {
                notification.setCallId(call.getId().toString());
                notification.setConversationId(call.getConversationId().toString());
                metadata.put("callId", call.getId());
                metadata.put("initiatorId", call.getInitiatedBy().getId());
                metadata.put("conversationId", call.getConversationId());
                metadata.put("type", call.getType()); // Ajout du type d'appel
            }
        } else if (data instanceof ConversationDTO conversation) {
            notification.setConversationId(conversation.getId().toString());
            metadata.put("conversationId", conversation.getId());
            metadata.put("name", conversation.getName() != null ? conversation.getName() : "");
        }
        notification.setMetadataMap(metadata);
        notification = notificationRepository.save(notification);

        NotificationDTO notificationDTO = notificationMapper.toDto(notification);

        try {
            messagingTemplate.convertAndSendToUser(
                    userId.toString(),
                    "/queue/notifications",
                    notificationDTO
            );
            logger.info("Sent in-app notification to userId: " + userId + " at /user/" + userId + "/queue/notifications");
        } catch (Exception e) {
            logger.severe("Failed to send in-app notification to userId: " + userId + ": " + e.getMessage());
        }
    }

    @Override
    public void sendMissedCallNotification(Long userId, CallDTO call) {
        if (shouldSendNotification(userId, "MISSED_CALL")) {
            String initiatorUsername = call.getInitiatedBy() != null && call.getInitiatedBy().getUsername() != null ?
                    call.getInitiatedBy().getUsername() : "Anonymous";
            createInAppNotification(
                    userId,
                    "MISSED_CALL",
                    "Missed Call",
                    "Missed call from " + initiatorUsername,
                    call
            );
        }
    }

    @Override
    public void sendGroupUpdateNotification(List<Long> userIds, ConversationDTO conversation, String updateType) {
        userIds.forEach(userId -> {
            if (shouldSendNotification(userId, "GROUP_UPDATE")) {
                createInAppNotification(
                        userId,
                        "GROUP_UPDATE",
                        "Group Updated",
                        "Group " + (conversation.getName() != null ? conversation.getName() : "Unknown") + " updated: " + updateType,
                        conversation
                );
            }
        });
    }

    @Override
    public void sendEmailNotification(Long userId, String subject, String body) {
        logger.info("Sending email to userId: " + userId + ": " + subject);
        // TODO: Implement actual email sending logic (e.g., using Spring Mail)
    }

    @Override
    public void sendMissedMessagesEmail(Long userId, List<MessageDTO> messages) {
        String body = messages.stream()
                .map(msg -> "Message from " + (msg.getSender() != null && msg.getSender().getUsername() != null ?
                        msg.getSender().getUsername() : "Anonymous") + ": " + msg.getContent())
                .collect(Collectors.joining("\n"));
        sendEmailNotification(userId, "Missed Messages", body);
    }

    @Override
    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserId(userId)
                .stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void markNotificationAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    public void markAllNotificationsAsRead(Long userId) {
        notificationRepository.findByUserId(userId)
                .forEach(notif -> {
                    notif.setRead(true);
                    notificationRepository.save(notif);
                });
    }

    @Override
    public void updateNotificationPreferences(Long userId, Object preferences) {
        if (preferences instanceof Map) {
            notificationPreferences.put(userId, (Map<String, Object>) preferences);
        } else {
            throw new IllegalArgumentException("Preferences must be a Map");
        }
    }

    @Override
    public Object getUserNotificationPreferences(Long userId) {
        return notificationPreferences.getOrDefault(userId, Map.of());
    }

    @Override
    public boolean shouldSendNotification(Long userId, String notificationType) {
        Map<String, Object> prefs = notificationPreferences.getOrDefault(userId, Map.of());
        boolean enabled = (boolean) prefs.getOrDefault(notificationType, true);
        logger.info("Notification preference for userId: " + userId + ", type: " + notificationType + ": " + enabled);
        return enabled;
    }

    @Override
    public void sendBulkNotifications(List<Long> userIds, String type, Object data) {
        userIds.forEach(userId -> {
            if (shouldSendNotification(userId, type)) {
                createInAppNotification(userId, type, type, "Notification", data);
            }
        });
    }

    @Override
    public void scheduleNotification(Long userId, String type, Object data, long delayInMillis) {
        new Thread(() -> {
            try {
                Thread.sleep(delayInMillis);
                createInAppNotification(userId, type, type, "Scheduled Notification", data);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                logger.severe("Scheduled notification interrupted for userId: " + userId);
            }
        }).start();
    }

    @Override
    public void registerDeviceToken(Long userId, String deviceToken, String platform) {
        deviceTokens.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(deviceToken);
    }

    @Override
    public void unregisterDeviceToken(Long userId, String deviceToken) {
        deviceTokens.computeIfPresent(userId, (k, tokens) -> {
            tokens.remove(deviceToken);
            return tokens.isEmpty() ? null : tokens;
        });
    }

    @Override
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId)
                .stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getUserDeviceTokens(Long userId) {
        return deviceTokens.getOrDefault(userId, List.of());
    }
}
