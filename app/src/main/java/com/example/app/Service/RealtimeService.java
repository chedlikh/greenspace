package com.example.app.Service;

import com.example.app.DTOs.ConversationDTO;
import com.example.app.DTOs.SendMessageDTO;
import com.example.app.Entities.Message;

import java.util.List;

public interface RealtimeService {
    void processRealtimeMessage(SendMessageDTO messageDTO, Long senderId);

    void processMessageStatusUpdate(Long messageId, Long userId, String status);

    void processMessageReaction(Long messageId, String emoji, Long userId, boolean add);

    void processCallInitiation(Long conversationId, Message.MessageType callType, Long initiatorId);

    void processCallResponse(Long callId, Long userId, String response);

    void processCallEnd(Long callId, Long userId);

    void processCallMediaToggle(Long callId, Long userId, String mediaType, boolean enabled);

    void processTypingStart(Long conversationId, Long userId);

    void processTypingStop(Long conversationId, Long userId);

    void processUserOnline(Long userId);

    void processUserOffline(Long userId);

    void updateUserLastSeen(Long userId);

    void processConversationUpdate(Long conversationId, ConversationDTO updates);

    void processParticipantJoin(Long conversationId, Long userId);

    void processParticipantLeave(Long conversationId, Long userId);



    void syncUserConversations(Long userId);

    void syncConversationMessages(Long conversationId, Long userId);

    void syncUserStatus(Long userId);

    void broadcastEvent(String eventType, Object data, List<Long> targetUserIds);

    void broadcastToConversation(Long conversationId, String eventType, Object data);

    void broadcastGlobally(String eventType, Object data);
}
