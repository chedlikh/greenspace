package com.example.app.DTOs;

import lombok.Data;

@Data
public class DirectConversationDTO {
    private String userId;
    private Long otherUserId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getOtherUserId() {
        return otherUserId;
    }

    public void setOtherUserId(Long otherUserId) {
        this.otherUserId = otherUserId;
    }

    public DirectConversationDTO() {
    }

    public DirectConversationDTO(String userId, Long otherUserId) {
        this.userId = userId;
        this.otherUserId = otherUserId;
    }
}