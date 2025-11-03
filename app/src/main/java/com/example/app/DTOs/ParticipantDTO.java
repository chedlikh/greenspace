package com.example.app.DTOs;

import lombok.Data;

@Data
public class ParticipantDTO {
    private Long conversationId;
    private Long userId;
    private String role;
    private String addedByUserId; // Added for addParticipant
    private String removedByUserId;

    public String getAddedByUserId() {
        return addedByUserId;
    }

    public void setAddedByUserId(String addedByUserId) {
        this.addedByUserId = addedByUserId;
    }

    public String getRemovedByUserId() {
        return removedByUserId;
    }

    public void setRemovedByUserId(String removedByUserId) {
        this.removedByUserId = removedByUserId;
    }

    public ParticipantDTO(Long conversationId, Long userId, String role, String addedByUserId, String removedByUserId) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.role = role;
        this.addedByUserId = addedByUserId;
        this.removedByUserId = removedByUserId;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public ParticipantDTO() {
    }

    public ParticipantDTO(Long conversationId, Long userId, String role) {
        this.conversationId = conversationId;
        this.userId = userId;
        this.role = role;
    }
}