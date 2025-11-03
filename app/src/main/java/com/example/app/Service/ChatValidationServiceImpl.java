package com.example.app.Service;

import com.example.app.Entities.Call;
import com.example.app.Entities.ConversationParticipant;
import com.example.app.Entities.Message;
import com.example.app.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatValidationServiceImpl implements ChatValidationService {

    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private CallRepository callRepository;
    @Autowired
    private ConversationParticipantRepository participantRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private CallParticipantRepository callParticipantRepository;
    @Autowired
    private FileValidator fileValidator; // Replace FileUploadService with FileValidator

    private final Map<Long, Long> rateLimits = new ConcurrentHashMap<>(); // Simple rate limiting

    @Override
    public boolean validateMessageContent(String content) {
        return content != null && content.length() <= 1000 && !validateMessageForSpam(content);
    }

    @Override
    public boolean validateMessageType(String messageType) {
        return Arrays.stream(Message.MessageType.values())
                .anyMatch(type -> type.name().equalsIgnoreCase(messageType));
    }

    @Override
    public boolean canUserSendMessage(Long conversationId, Long userId) {
        return canUserAccessConversation(conversationId, userId) && checkMessageRateLimit(userId);
    }

    @Override
    public boolean isValidMessageLength(String content) {
        return content != null && content.length() <= 1000;
    }

    @Override
    public boolean validateFileUpload(MultipartFile file) {
        return fileValidator.validateFile(file);
    }

    @Override
    public boolean validateFileType(MultipartFile file, String expectedType) {
        return fileValidator.validateFileType(file, expectedType);
    }

    @Override
    public boolean validateFileSize(MultipartFile file) {
        return fileValidator.validateFileSize(file);
    }

    @Override
    public boolean validateImageFile(MultipartFile file) {
        return fileValidator.validateImageFile(file);
    }

    @Override
    public boolean validateVideoFile(MultipartFile file) {
        return fileValidator.validateVideoFile(file);
    }

    @Override
    public boolean validateAudioFile(MultipartFile file) {
        return fileValidator.validateAudioFile(file);
    }

    @Override
    public boolean validateDocumentFile(MultipartFile file) {
        return fileValidator.validateDocumentFile(file);
    }

    @Override
    public boolean canUserAccessConversation(Long conversationId, Long userId) {
        return participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .map(part -> part.getActive() && !part.getBlocked())
                .orElse(false);
    }

    @Override
    public boolean canUserModifyConversation(Long conversationId, Long userId) {
        return participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .map(part -> part.getRole() == ConversationParticipant.ParticipantRole.ADMIN)
                .orElse(false);
    }

    @Override
    public boolean canUserAddParticipants(Long conversationId, Long userId) {
        return canUserModifyConversation(conversationId, userId);
    }

    @Override
    public boolean canUserRemoveParticipants(Long conversationId, Long userId) {
        return canUserModifyConversation(conversationId, userId);
    }

    @Override
    public boolean validateConversationName(String name) {
        return name != null && name.length() >= 1 && name.length() <= 100;
    }

    @Override
    public boolean validateGroupDescription(String description) {
        return description == null || description.length() <= 500;
    }

    @Override
    public boolean canUserInitiateCall(Long conversationId, Long userId) {
        return canUserAccessConversation(conversationId, userId) && checkCallInitiationRateLimit(userId);
    }

    @Override
    public boolean canUserJoinCall(Long callId, Long userId) {
        return callRepository.findById(callId)
                .map(call -> canUserAccessConversation(call.getConversation().getId(), userId))
                .orElse(false);
    }

    @Override
    public boolean isValidCallType(String callType) {
        return Arrays.stream(Call.CallType.values())
                .anyMatch(type -> type.name().equalsIgnoreCase(callType));
    }

    @Override
    public boolean isCallParticipant(Long callId, Long userId) {
        return callParticipantRepository.findByCallIdAndUserId(callId, userId).isPresent();
    }

    @Override
    public boolean isValidUserId(Long userId) {
        return userRepository.findById(userId).isPresent();
    }

    @Override
    public boolean areUsersInSameConversation(Long userId1, Long userId2, Long conversationId) {
        return canUserAccessConversation(conversationId, userId1) && canUserAccessConversation(conversationId, userId2);
    }

    @Override
    public boolean canUsersStartDirectConversation(Long userId1, Long userId2) {
        return isValidUserId(userId1) && isValidUserId(userId2) && !userId1.equals(userId2);
    }

    @Override
    public boolean checkMessageRateLimit(Long userId) {
        long currentTime = System.currentTimeMillis();
        Long lastMessageTime = rateLimits.getOrDefault(userId, 0L);
        if (currentTime - lastMessageTime < 1000) { // 1 message per second
            return false;
        }
        rateLimits.put(userId, currentTime);
        return true;
    }

    @Override
    public boolean checkFileUploadRateLimit(Long userId) {
        return checkMessageRateLimit(userId);
    }

    @Override
    public boolean checkCallInitiationRateLimit(Long userId) {
        long currentTime = System.currentTimeMillis();
        Long lastCallTime = rateLimits.getOrDefault(userId, 0L);
        if (currentTime - lastCallTime < 60000) { // 1 call per minute
            return false;
        }
        rateLimits.put(userId, currentTime);
        return true;
    }

    @Override
    public boolean validateMessageForSpam(String content) {
        return content != null && content.toLowerCase().contains("spam");
    }

    @Override
    public boolean validateFileForMalware(MultipartFile file) {
        return false; // Moved to FileValidator
    }

    @Override
    public boolean validateImageContent(MultipartFile file) {
        return true; // Moved to FileValidator
    }

    @Override
    public boolean hasPermission(Long userId, String permission, Long resourceId) {
        return true;
    }

    @Override
    public boolean canPerformAction(Long userId, String action, Long conversationId) {
        return switch (action) {
            case "MODIFY_CONVERSATION" -> canUserModifyConversation(conversationId, userId);
            case "SEND_MESSAGE" -> canUserSendMessage(conversationId, userId);
            case "ADD_PARTICIPANT" -> canUserAddParticipants(conversationId, userId);
            case "REMOVE_PARTICIPANT" -> canUserRemoveParticipants(conversationId, userId);
            default -> false;
        };
    }

    @Override
    public boolean canUserDeleteMessage(Long messageId, Long userId) {
        return messageRepository.findById(messageId)
                .map(message -> message.getSender().getId().equals(userId) ||
                        canUserModifyConversation(message.getConversation().getId(), userId))
                .orElse(false);
    }

    @Override
    public boolean canUserEditMessage(Long messageId, Long userId) {
        return messageRepository.findById(messageId)
                .map(message -> message.getSender().getId().equals(userId))
                .orElse(false);
    }

    @Override
    public void canUserAccessCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found"));
        canUserAccessConversation(call.getConversation().getId(), userId);
    }
}