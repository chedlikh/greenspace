package com.example.app.Service;

import com.example.app.DTOs.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;
import java.util.stream.Collectors;

@Service
public class WebSocketServiceImpl implements WebSocketService {

    private static final Logger logger = Logger.getLogger(WebSocketServiceImpl.class.getName());

    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    private final Map<Long, String> connectedUsers = new ConcurrentHashMap<>();

    // --- Existing methods ---
    @Override
    public List<String> getConnectedUsers() {
        long startTime = System.currentTimeMillis();
        try {
            List<String> users = connectedUsers.keySet().stream()
                    .map(String::valueOf)
                    .collect(Collectors.toList());
            logger.info("Retrieved connected users in " + (System.currentTimeMillis() - startTime) + "ms");
            return users;
        } catch (Exception e) {
            logger.severe("Failed to get connected users: " + e.getMessage());
            return List.of();
        }
    }

    @Override
    @Async
    public void broadcastMessage(MessageDTO message) {
        if (message == null || message.getConversationId() == null) {
            logger.warning("Invalid message or conversationId for broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + message.getConversationId(), message);
            logger.info("Broadcast message to /topic/conversation/" + message.getConversationId() + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast message: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendMessageToConversation(Long conversationId, MessageDTO message) {
        if (conversationId == null || message == null) {
            logger.warning("Invalid conversationId or message for sending");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, message);
            logger.info("Sent message to /topic/conversation/" + conversationId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send message to conversation: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendMessageToUser(Long userId, MessageDTO message) {
        if (userId == null || message == null) {
            logger.warning("Invalid userId or message for sending");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/messages", message);
            logger.info("Sent message to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send message to user: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendPrivateMessage(Long userId, Object message) {
        if (userId == null || message == null) {
            logger.warning("Invalid userId or message for private message");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/private", message);
            logger.info("Sent private message to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send private message: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void broadcastTypingIndicator(Long conversationId, TypingIndicatorDTO typingIndicator) {
        if (conversationId == null || typingIndicator == null) {
            logger.warning("Invalid conversationId or typingIndicator for broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", typingIndicator);
            logger.info("Broadcast typing indicator to /topic/conversation/" + conversationId + "/typing in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast typing indicator: " + e.getMessage());
        }
    }

    @Override
    public void sendTypingStatus(Long conversationId, Long userId, boolean isTyping) {
        if (conversationId == null || userId == null) {
            logger.warning("Invalid conversationId or userId for typing status");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            TypingIndicatorDTO indicator = new TypingIndicatorDTO();
            indicator.setConversationId(conversationId);
            // Assuming UserDTO constructor or setting method exists
            UserDTO userDTO = new UserDTO();
            userDTO.setId(userId);
            indicator.setUser(userDTO);
            indicator.setTyping(isTyping);
            broadcastTypingIndicator(conversationId, indicator);
            logger.info("Sent typing status for conversation " + conversationId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send typing status: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void broadcastCallEvent(Long conversationId, CallDTO call) {
        if (conversationId == null || call == null) {
            logger.warning("Invalid conversationId or call for broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/call", call);
            logger.info("Broadcast call event to /topic/conversation/" + conversationId + "/call in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast call event: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyCallParticipants(Long callId, String eventType, Object data) {
        if (callId == null || eventType == null) {
            logger.warning("Invalid callId or eventType for notify call participants");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/call/" + callId, Map.of("eventType", eventType, "data", data));
            logger.info("Notified call participants for call " + callId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify call participants: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendCallInvitation(Long userId, CallDTO call) {
        if (userId == null || call == null) {
            logger.warning("Invalid userId or call for call invitation");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/call", call);
            logger.info("Sent call invitation to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send call invitation: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendCallUpdate(Long callId, CallDTO call) {
        if (callId == null || call == null) {
            logger.warning("Invalid callId or call for call update");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/call/" + callId, call);
            logger.info("Sent call update for call " + callId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send call update: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void broadcastUserOnlineStatus(Long userId, boolean isOnline) {
        if (userId == null) {
            logger.warning("Invalid userId for online status broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/users/status", Map.of("userId", userId, "isOnline", isOnline));
            logger.info("Broadcast user online status for user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast user online status: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyUserStatusChange(Long userId, String status) {
        if (userId == null || status == null) {
            logger.warning("Invalid userId or status for status change");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/users/status", Map.of("userId", userId, "status", status));
            logger.info("Notified user status change for user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify user status change: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyMessageDelivered(Long messageId, Long userId) {
        if (messageId == null || userId == null) {
            logger.warning("Invalid messageId or userId for message delivered notification");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/message/status",
                    Map.of("messageId", messageId, "status", "DELIVERED"));
            logger.info("Notified message delivered for message " + messageId + " to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify message delivered: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyMessageRead(Long messageId, Long userId) {
        if (messageId == null || userId == null) {
            logger.warning("Invalid messageId or userId for message read notification");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/message/status",
                    Map.of("messageId", messageId, "status", "READ"));
            logger.info("Notified message read for message " + messageId + " to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify message read: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void broadcastMessageReaction(Long conversationId, MessageReactionDTO reaction) {
        if (conversationId == null || reaction == null) {
            logger.warning("Invalid conversationId or reaction for broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/reaction", reaction);
            logger.info("Broadcast message reaction to /topic/conversation/" + conversationId + "/reaction in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast message reaction: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyConversationUpdate(Long conversationId, ConversationDTO conversation) {
        if (conversationId == null || conversation == null) {
            logger.warning("Invalid conversationId or conversation for update");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, conversation);
            logger.info("Notified conversation update for conversation " + conversationId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify conversation update: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyParticipantAdded(Long conversationId, ConversationParticipantDTO participant) {
        if (conversationId == null || participant == null) {
            logger.warning("Invalid conversationId or participant for notification");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant", participant);
            logger.info("Notified participant added for conversation " + conversationId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify participant added: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void notifyParticipantRemoved(Long conversationId, Long userId) {
        if (conversationId == null || userId == null) {
            logger.warning("Invalid conversationId or userId for participant removal");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant",
                    Map.of("userId", userId, "action", "removed"));
            logger.info("Notified participant removed for conversation " + conversationId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to notify participant removed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendNotification(Long userId, String type, Object data) {
        if (userId == null || type == null || data == null) {
            logger.warning("Invalid userId, type, or data for notification");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications",
                    Map.of("type", type, "data", data));
            logger.info("Sent notification to user " + userId + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to send notification: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void broadcastToConversationParticipants(Long conversationId, String destination, Object message) {
        if (conversationId == null || destination == null || message == null) {
            logger.warning("Invalid conversationId, destination, or message for conversation broadcast");
            return;
        }
        long startTime = System.currentTimeMillis();
        try {
            messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + destination, message);
            logger.info("Broadcast to /topic/conversation/" + conversationId + destination + " in " +
                    (System.currentTimeMillis() - startTime) + "ms");
        } catch (Exception e) {
            logger.severe("Failed to broadcast to conversation participants: " + e.getMessage());
        }
    }

    // --- Added Method ---

    /**
     * Sends a WebRTC signaling message (offer, answer, ICE candidate) to a specific user.
     *
     * @param userId        The ID of the target user.
     * @param signalPayload The signaling payload (typically a Map or a dedicated DTO).
     */
    @Override
    @Async
    public void sendWebRTCSignal(Long userId, Object signalPayload) {
        if (userId == null || signalPayload == null) {
            logger.warning("Invalid userId or signalPayload for WebRTC signal");
            return;
        }
        try {
            // Destination should match the frontend subscription for WebRTC signals
            String destination = "/queue/call/signal";
            messagingTemplate.convertAndSendToUser(userId.toString(), destination, signalPayload);
            logger.info("Sent WebRTC signal to user " + userId + " on destination " + destination);
        } catch (Exception e) {
            logger.severe("Failed to send WebRTC signal to user " + userId + ": " + e.getMessage());
        }
    }

    // --- Other existing methods (if any) ---

    // Example placeholder for isUserConnected if needed by other services
    @Override
    public boolean isUserConnected(Long userId) {
        // This requires tracking connections, e.g., via WebSocketEventListener
        // Placeholder implementation
        return connectedUsers.containsKey(userId);
    }

    // Methods to add/remove users from connectedUsers map (called from WebSocketEventListener)
    public void addUser(Long userId, String sessionId) {
        connectedUsers.put(userId, sessionId);
        logger.info("User connected: " + userId);
        // Optionally broadcast online status here
        // broadcastUserOnlineStatus(userId, true);
    }

    public void removeUser(Long userId) {
        if (connectedUsers.containsKey(userId)) {
            connectedUsers.remove(userId);
            logger.info("User disconnected: " + userId);
            // Optionally broadcast offline status here
            // broadcastUserOnlineStatus(userId, false);
        }
    }
}

