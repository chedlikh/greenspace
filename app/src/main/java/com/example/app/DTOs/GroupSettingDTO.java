package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class GroupSettingDTO {
    private Long id;
    private Long conversationId;
    private String settingKey;
    private String settingValue;
    private LocalDateTime updatedAt;

    public GroupSettingDTO() {
    }

    public GroupSettingDTO(Long id, Long conversationId, String settingKey, String settingValue, LocalDateTime updatedAt) {
        this.id = id;
        this.conversationId = conversationId;
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.updatedAt = updatedAt;
    }

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

    public String getSettingKey() {
        return settingKey;
    }

    public void setSettingKey(String settingKey) {
        this.settingKey = settingKey;
    }

    public String getSettingValue() {
        return settingValue;
    }

    public void setSettingValue(String settingValue) {
        this.settingValue = settingValue;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}