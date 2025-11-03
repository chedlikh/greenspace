package com.example.app.DTOs;

import lombok.Data;

@Data
public class ConversationActionDTO {
    private Long conversationId;
    private String userId;

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public ConversationActionDTO() {
    }

    public ConversationActionDTO(Long conversationId, String userId) {
        this.conversationId = conversationId;
        this.userId = userId;
    }
}