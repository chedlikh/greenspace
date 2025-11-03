package com.example.app.DTOs;

import lombok.Data;

import java.util.List;

@Data
public class GroupConversationDTO {
    private String name;
    private String description;
    private String theme;
    private List<Long> participantIds;
    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public GroupConversationDTO(String name, String description, String theme, List<Long> participantIds, String userId) {
        this.name = name;
        this.description = description;
        this.theme = theme;
        this.participantIds = participantIds;
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public List<Long> getParticipantIds() {
        return participantIds;
    }

    public void setParticipantIds(List<Long> participantIds) {
        this.participantIds = participantIds;
    }

    public GroupConversationDTO() {
    }

    public GroupConversationDTO(String name, String description, String theme, List<Long> participantIds) {
        this.name = name;
        this.description = description;
        this.theme = theme;
        this.participantIds = participantIds;
    }
}