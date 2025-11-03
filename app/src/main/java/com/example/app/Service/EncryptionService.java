package com.example.app.Service;

public interface EncryptionService {
    String encryptMessageContent(String content, Long conversationId);

    String decryptMessageContent(String encryptedContent, Long conversationId);

    byte[] encryptFile(byte[] fileData, Long conversationId);

    byte[] decryptFile(byte[] encryptedFileData, Long conversationId);

    void generateConversationKey(Long conversationId);

    String getConversationKey(Long conversationId, Long userId);

    void rotateConversationKey(Long conversationId);
}
