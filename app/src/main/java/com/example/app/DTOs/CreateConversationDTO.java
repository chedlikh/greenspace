package com.example.app.DTOs;

import lombok.Data;

import java.util.List;

@Data
public class CreateConversationDTO {
    private String name;
    private Boolean isGroup;
    private String groupDescription;
    private String theme;
    private List<Long> participantIds;
    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public CreateConversationDTO(String name, Boolean isGroup, String groupDescription, String theme, List<Long> participantIds, String userId) {
        this.name = name;
        this.isGroup = isGroup;
        this.groupDescription = groupDescription;
        this.theme = theme;
        this.participantIds = participantIds;
        this.userId = userId;
    }

    public CreateConversationDTO() {
    }

    public CreateConversationDTO(String name, Boolean isGroup, String groupDescription, String theme, List<Long> participantIds) {
        this.name = name;
        this.isGroup = isGroup;
        this.groupDescription = groupDescription;
        this.theme = theme;
        this.participantIds = participantIds;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getGroup() {
        return isGroup;
    }

    public void setGroup(Boolean group) {
        isGroup = group;
    }

    public String getGroupDescription() {
        return groupDescription;
    }

    public void setGroupDescription(String groupDescription) {
        this.groupDescription = groupDescription;
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
}
