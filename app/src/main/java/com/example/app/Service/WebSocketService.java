package com.example.app.Service;

import com.example.app.DTOs.*;
import org.springframework.scheduling.annotation.Async;

import java.util.List;
import java.util.Map;

public interface WebSocketService {


    // --- Existing methods ---
    List<String> getConnectedUsers();

    @Async
    void broadcastMessage(MessageDTO message);

    @Async
    void sendMessageToConversation(Long conversationId, MessageDTO message);

    @Async
    void sendMessageToUser(Long userId, MessageDTO message);

    @Async
    void sendPrivateMessage(Long userId, Object message);

    @Async
    void broadcastTypingIndicator(Long conversationId, TypingIndicatorDTO typingIndicator);

    void sendTypingStatus(Long conversationId, Long userId, boolean isTyping);

    @Async
    void broadcastCallEvent(Long conversationId, CallDTO call);

    @Async
    void notifyCallParticipants(Long callId, String eventType, Object data);

    @Async
    void sendCallInvitation(Long userId, CallDTO call);

    @Async
    void sendCallUpdate(Long callId, CallDTO call);

    @Async
    void broadcastUserOnlineStatus(Long userId, boolean isOnline);

    @Async
    void notifyUserStatusChange(Long userId, String status);

    @Async
    void notifyMessageDelivered(Long messageId, Long userId);

    @Async
    void notifyMessageRead(Long messageId, Long userId);

    @Async
    void broadcastMessageReaction(Long conversationId, MessageReactionDTO reaction);

    @Async
    void notifyConversationUpdate(Long conversationId, ConversationDTO conversation);

    @Async
    void notifyParticipantAdded(Long conversationId, ConversationParticipantDTO participant);

    @Async
    void notifyParticipantRemoved(Long conversationId, Long userId);

    @Async
    void sendNotification(Long userId, String type, Object data);

    @Async
    void broadcastToConversationParticipants(Long conversationId, String destination, Object message);

    @Async
    void sendWebRTCSignal(Long userId, Object signalPayload);

    // Example placeholder for isUserConnected if needed by other services
    boolean isUserConnected(Long userId);
}
