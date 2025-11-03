package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TypingIndicatorDTO {
    private Long id;
    private Long conversationId;
    private UserDTO user;
    private Boolean typing; // Changed from isTyping to typing
    private LocalDateTime lastTypingDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public Boolean getTyping() {
        return typing;
    }

    public void setTyping(Boolean typing) {
        this.typing = typing;
    }

    public LocalDateTime getLastTypingDate() {
        return lastTypingDate;
    }

    public void setLastTypingDate(LocalDateTime lastTypingDate) {
        this.lastTypingDate = lastTypingDate;
    }

    public TypingIndicatorDTO() {
    }

    public TypingIndicatorDTO(Long id, Long conversationId, UserDTO user, Boolean typing, LocalDateTime lastTypingDate) {
        this.id = id;
        this.conversationId = conversationId;
        this.user = user;
        this.typing = typing;
        this.lastTypingDate = lastTypingDate;
    }
}