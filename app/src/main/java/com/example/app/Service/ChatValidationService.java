package com.example.app.Service;

import org.springframework.web.multipart.MultipartFile;

public interface ChatValidationService {
    boolean validateMessageContent(String content);

    boolean validateMessageType(String messageType);

    boolean canUserSendMessage(Long conversationId, Long userId);

    boolean isValidMessageLength(String content);

    boolean validateFileUpload(MultipartFile file);

    boolean validateFileType(MultipartFile file, String expectedType);

    boolean validateFileSize(MultipartFile file);

    boolean validateImageFile(MultipartFile file);

    boolean validateVideoFile(MultipartFile file);

    boolean validateAudioFile(MultipartFile file);

    boolean validateDocumentFile(MultipartFile file);

    boolean canUserAccessConversation(Long conversationId, Long userId);

    boolean canUserModifyConversation(Long conversationId, Long userId);

    boolean canUserAddParticipants(Long conversationId, Long userId);

    boolean canUserRemoveParticipants(Long conversationId, Long userId);

    boolean validateConversationName(String name);

    boolean validateGroupDescription(String description);

    boolean canUserInitiateCall(Long conversationId, Long userId);

    boolean canUserJoinCall(Long callId, Long userId);

    boolean isValidCallType(String callType);

    boolean isCallParticipant(Long callId, Long userId);

    boolean isValidUserId(Long userId);

    boolean areUsersInSameConversation(Long userId1, Long userId2, Long conversationId);

    boolean canUsersStartDirectConversation(Long userId1, Long userId2);

    boolean checkMessageRateLimit(Long userId);

    boolean checkFileUploadRateLimit(Long userId);

    boolean checkCallInitiationRateLimit(Long userId);

    boolean validateMessageForSpam(String content);

    boolean validateFileForMalware(MultipartFile file);

    boolean validateImageContent(MultipartFile image);

    boolean hasPermission(Long userId, String permission, Long resourceId);

    boolean canPerformAction(Long userId, String action, Long conversationId);
    boolean canUserDeleteMessage(Long messageId, Long userId);
    boolean canUserEditMessage(Long messageId, Long userId);

    void canUserAccessCall(Long callId, Long userId);
}
