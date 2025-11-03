package com.example.app.Service;

import com.example.app.DTOs.TypingIndicatorDTO;

import java.util.List;

public interface TypingIndicatorService {
    void startTyping(Long conversationId, Long userId);

    void stopTyping(Long conversationId, Long userId);

    void updateTypingStatus(Long conversationId, Long userId, boolean isTyping);

    List<TypingIndicatorDTO> getTypingUsers(Long conversationId);

    List<String> getTypingUsernames(Long conversationId);

    boolean isUserTyping(Long conversationId, Long userId);

    void cleanupExpiredTypingIndicators();

    void clearTypingIndicator(Long conversationId, Long userId);

    void clearAllTypingIndicators(Long conversationId);
}
