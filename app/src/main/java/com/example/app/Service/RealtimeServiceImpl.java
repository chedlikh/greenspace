package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.Call;
import com.example.app.Entities.ConversationParticipant;
import com.example.app.Entities.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
@Transactional
@MessageMapping("/chat")
public class RealtimeServiceImpl implements RealtimeService {
    private static final Logger logger = Logger.getLogger(RealtimeServiceImpl.class.getName());

    @Autowired
    private MessageService messageService;
    @Autowired
    private CallService callService;
    @Autowired
    private TypingIndicatorService typingIndicatorService;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private ConversationService conversationService;

    @Override
    public void processRealtimeMessage(SendMessageDTO messageDTO, Long senderId) {
        MessageDTO sentMessage = messageService.sendMessage(messageDTO, senderId);
        webSocketService.broadcastMessage(sentMessage);
    }

    @Override
    public void processMessageStatusUpdate(Long messageId, Long userId, String status) {
        if ("DELIVERED".equalsIgnoreCase(status)) {
            messageService.markMessageAsDelivered(messageId, userId);
        } else if ("READ".equalsIgnoreCase(status)) {
            messageService.markMessageAsRead(messageId, userId);
        }
    }

    @Override
    public void processMessageReaction(Long messageId, String emoji, Long userId, boolean add) {
        if (add) {
            messageService.addReaction(messageId, emoji, userId);
        } else {
            messageService.removeReaction(messageId, emoji, userId);
        }
    }

    @Override
    public void processCallInitiation(Long conversationId, Message.MessageType callType, Long initiatorId) {
        CallCreateDTO callCreateDTO = new CallCreateDTO();
        callCreateDTO.setConversationId(conversationId);
        callCreateDTO.setInitiatedById(initiatorId);
        callCreateDTO.setType(callType == Message.MessageType.VOICE ? Call.CallType.VOICE : Call.CallType.VIDEO);
        callCreateDTO.setStartedDate(LocalDateTime.now());

        callService.initiateCall(callCreateDTO);
    }

    @Override
    public void processCallResponse(Long callId, Long userId, String response) {
        if ("JOIN".equalsIgnoreCase(response)) {
            callService.joinCall(callId, userId);
        } else if ("REJECT".equalsIgnoreCase(response)) {
            callService.rejectCall(callId, userId);
        }
    }

    @Override
    public void processCallEnd(Long callId, Long userId) {
        callService.endCall(callId, userId);
    }

    @Override
    public void processCallMediaToggle(Long callId, Long userId, String mediaType, boolean enabled) {
        CallParticipantDTO participant = callService.getCallParticipants(callId)
                .stream()
                .filter(p -> p.getUser().getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        if ("AUDIO".equalsIgnoreCase(mediaType)) {
            callService.updateMediaSettings(callId, userId, enabled, participant.getVideoEnabled());
        } else if ("VIDEO".equalsIgnoreCase(mediaType)) {
            callService.updateMediaSettings(callId, userId, participant.getAudioEnabled(), enabled);
        }
    }

    @Override
    public void processTypingStart(Long conversationId, Long userId) {
        typingIndicatorService.startTyping(conversationId, userId);
    }

    @Override
    public void processTypingStop(Long conversationId, Long userId) {
        typingIndicatorService.stopTyping(conversationId, userId);
    }

    @Override
    public void processUserOnline(Long userId) {
        webSocketService.broadcastUserOnlineStatus(userId, true);
    }

    @Override
    public void processUserOffline(Long userId) {
        webSocketService.broadcastUserOnlineStatus(userId, false);
    }

    @Override
    public void updateUserLastSeen(Long userId) {
        conversationService.getUserConversations(userId)
                .forEach(conv -> conversationService.updateLastSeen(conv.getId(), userId));
    }

    @Override
    public void processConversationUpdate(Long conversationId, ConversationDTO updates) {
        conversationService.updateConversation(conversationId, updates, updates.getCreatedBy().getId());
        webSocketService.notifyConversationUpdate(conversationId, updates);
    }

    @Override
    public void processParticipantJoin(Long conversationId, Long userId) {
        ConversationParticipantDTO participant = conversationService.addParticipant(
                conversationId,
                userId,
                userId,
                ConversationParticipant.ParticipantRole.MEMBER
        );
        webSocketService.notifyParticipantAdded(conversationId, participant);
    }

    @Override
    public void processParticipantLeave(Long conversationId, Long userId) {
        conversationService.removeParticipant(conversationId, userId, userId);
        webSocketService.notifyParticipantRemoved(conversationId, userId);
    }



    @MessageMapping("/webrtc.offer")
    public void processWebRTCOffer(@Payload Map<String, Object> payload) {
        try {
            Long callId = payload.get("callId") != null ? Long.valueOf(payload.get("callId").toString()) : null;
            Long fromUserId = payload.get("fromUserId") != null ? Long.valueOf(payload.get("fromUserId").toString()) : null;
            Long toUserId = payload.get("toUserId") != null ? Long.valueOf(payload.get("toUserId").toString()) : null;
            String offer = payload.get("offer") != null ? payload.get("offer").toString() : null;

            if (callId == null || fromUserId == null || offer == null) {
                logger.severe("Invalid WebRTC offer payload: " + payload);
                throw new IllegalArgumentException("Missing required fields in WebRTC offer");
            }

            List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
            if (participants.isEmpty()) {
                logger.severe("No participants found for callId: " + callId);
                throw new IllegalArgumentException("No participants found for call");
            }

            // If toUserId is provided, use it; otherwise, send to all other participants
            if (toUserId != null) {
                CallParticipantDTO target = participants.stream()
                        .filter(p -> p.getUser().getId().equals(toUserId))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Target participant not found: " + toUserId));
                webSocketService.sendWebRTCSignal(toUserId, Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "offer",
                        "offer", offer
                ));
                logger.info("Sent WebRTC offer to user: " + toUserId);
            } else {
                // For group calls, send to all participants except the sender
                participants.stream()
                        .filter(p -> !p.getUser().getId().equals(fromUserId))
                        .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                                "callId", callId,
                                "fromUserId", fromUserId,
                                "type", "offer",
                                "offer", offer
                        )));
                logger.info("Sent WebRTC offer to all participants for callId: " + callId);
            }
        } catch (Exception e) {
            logger.severe("Failed to process WebRTC offer: " + e.getMessage());
            throw new RuntimeException("Error processing WebRTC offer", e);
        }
    }

    @MessageMapping("/webrtc.answer")
    public void processWebRTCAnswer(@Payload Map<String, Object> payload) {
        try {
            Long callId = payload.get("callId") != null ? Long.valueOf(payload.get("callId").toString()) : null;
            Long fromUserId = payload.get("fromUserId") != null ? Long.valueOf(payload.get("fromUserId").toString()) : null;
            Long toUserId = payload.get("toUserId") != null ? Long.valueOf(payload.get("toUserId").toString()) : null;
            String answer = payload.get("answer") != null ? payload.get("answer").toString() : null;

            if (callId == null || fromUserId == null || answer == null) {
                logger.severe("Invalid WebRTC answer payload: " + payload);
                throw new IllegalArgumentException("Missing required fields in WebRTC answer");
            }

            List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
            if (participants.isEmpty()) {
                logger.severe("No participants found for callId: " + callId);
                throw new IllegalArgumentException("No participants found for call");
            }

            if (toUserId != null) {
                CallParticipantDTO target = participants.stream()
                        .filter(p -> p.getUser().getId().equals(toUserId))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Target participant not found: " + toUserId));
                webSocketService.sendWebRTCSignal(toUserId, Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "answer",
                        "answer", answer
                ));
                logger.info("Sent WebRTC answer to user: " + toUserId);
            } else {
                participants.stream()
                        .filter(p -> !p.getUser().getId().equals(fromUserId))
                        .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                                "callId", callId,
                                "fromUserId", fromUserId,
                                "type", "answer",
                                "answer", answer
                        )));
                logger.info("Sent WebRTC answer to all participants for callId: " + callId);
            }
        } catch (Exception e) {
            logger.severe("Failed to process WebRTC answer: " + e.getMessage());
            throw new RuntimeException("Error processing WebRTC answer", e);
        }
    }

    @MessageMapping("/webrtc.ice")
    public void processICECandidate(@Payload Map<String, Object> payload) {
        try {
            Long callId = payload.get("callId") != null ? Long.valueOf(payload.get("callId").toString()) : null;
            Long fromUserId = payload.get("fromUserId") != null ? Long.valueOf(payload.get("fromUserId").toString()) : null;
            Long toUserId = payload.get("toUserId") != null ? Long.valueOf(payload.get("toUserId").toString()) : null;
            String candidate = payload.get("candidate") != null ? payload.get("candidate").toString() : null;

            if (callId == null || fromUserId == null || candidate == null) {
                logger.severe("Invalid WebRTC ICE candidate payload: " + payload);
                throw new IllegalArgumentException("Missing required fields in WebRTC ICE candidate");
            }

            List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
            if (participants.isEmpty()) {
                logger.severe("No participants found for callId: " + callId);
                throw new IllegalArgumentException("No participants found for call");
            }

            if (toUserId != null) {
                CallParticipantDTO target = participants.stream()
                        .filter(p -> p.getUser().getId().equals(toUserId))
                        .findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("Target participant not found: " + toUserId));
                webSocketService.sendWebRTCSignal(toUserId, Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "iceCandidate",
                        "candidate", candidate
                ));
                logger.info("Sent ICE candidate to user: " + toUserId);
            } else {
                participants.stream()
                        .filter(p -> !p.getUser().getId().equals(fromUserId))
                        .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                                "callId", callId,
                                "fromUserId", fromUserId,
                                "type", "iceCandidate",
                                "candidate", candidate
                        )));
                logger.info("Sent ICE candidate to all participants for callId: " + callId);
            }
        } catch (Exception e) {
            logger.severe("Failed to process WebRTC ICE candidate: " + e.getMessage());
            throw new RuntimeException("Error processing WebRTC ICE candidate", e);
        }
    }

    @Override
    public void syncUserConversations(Long userId) {
        List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
        webSocketService.sendPrivateMessage(userId, conversations);
    }

    @Override
    public void syncConversationMessages(Long conversationId, Long userId) {
        List<MessageDTO> messages = messageService.getRecentMessages(conversationId, 50);
        webSocketService.sendPrivateMessage(userId, messages);
    }

    @Override
    public void syncUserStatus(Long userId) {
        boolean isOnline = webSocketService.isUserConnected(userId);
        webSocketService.broadcastUserOnlineStatus(userId, isOnline);
    }

    @Override
    public void broadcastEvent(String eventType, Object data, List<Long> targetUserIds) {
        targetUserIds.forEach(userId -> webSocketService.sendNotification(userId, eventType, data));
    }

    @Override
    public void broadcastToConversation(Long conversationId, String eventType, Object data) {
        webSocketService.broadcastToConversationParticipants(conversationId, "/" + eventType, data);
    }

    @Override
    public void broadcastGlobally(String eventType, Object data) {
        webSocketService.broadcastToConversationParticipants(0L, "/" + eventType, data);
    }
}