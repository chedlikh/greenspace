package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data

public class ConversationDTO {
    private Long id;
    private String name;
    private Boolean isGroup;
    private String groupImage;
    private String groupDescription;
    private String theme;
    private Boolean isArchived;
    private Boolean isPinned;
    private LocalDateTime createdDate;
    private LocalDateTime updatedDate;
    private UserDTO createdBy;
    private List<ConversationParticipantDTO> participants;
    private MessageDTO lastMessage;
    private Integer unreadMessagesCount;
    private Boolean isTyping;
    private List<String> typingUsers;
    private List<GroupSettingDTO> groupSettings;
    private String userId;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public ConversationDTO(Long id, String name, Boolean isGroup, String groupImage, String groupDescription, String theme, Boolean isArchived, Boolean isPinned, LocalDateTime createdDate, LocalDateTime updatedDate, UserDTO createdBy, List<ConversationParticipantDTO> participants, MessageDTO lastMessage, Integer unreadMessagesCount, Boolean isTyping, List<String> typingUsers, List<GroupSettingDTO> groupSettings, String userId) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
        this.groupImage = groupImage;
        this.groupDescription = groupDescription;
        this.theme = theme;
        this.isArchived = isArchived;
        this.isPinned = isPinned;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.createdBy = createdBy;
        this.participants = participants;
        this.lastMessage = lastMessage;
        this.unreadMessagesCount = unreadMessagesCount;
        this.isTyping = isTyping;
        this.typingUsers = typingUsers;
        this.groupSettings = groupSettings;
        this.userId = userId;
    }

    public ConversationDTO() {
    }

    public ConversationDTO(Long id, String name, Boolean isGroup, String groupImage, String groupDescription, String theme, Boolean isArchived, Boolean isPinned, LocalDateTime createdDate, LocalDateTime updatedDate, UserDTO createdBy, List<ConversationParticipantDTO> participants, MessageDTO lastMessage, Integer unreadMessagesCount, Boolean isTyping, List<String> typingUsers, List<GroupSettingDTO> groupSettings) {
        this.id = id;
        this.name = name;
        this.isGroup = isGroup;
        this.groupImage = groupImage;
        this.groupDescription = groupDescription;
        this.theme = theme;
        this.isArchived = isArchived;
        this.isPinned = isPinned;
        this.createdDate = createdDate;
        this.updatedDate = updatedDate;
        this.createdBy = createdBy;
        this.participants = participants;
        this.lastMessage = lastMessage;
        this.unreadMessagesCount = unreadMessagesCount;
        this.isTyping = isTyping;
        this.typingUsers = typingUsers;
        this.groupSettings = groupSettings;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getGroupImage() {
        return groupImage;
    }

    public void setGroupImage(String groupImage) {
        this.groupImage = groupImage;
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

    public Boolean getArchived() {
        return isArchived;
    }

    public void setArchived(Boolean archived) {
        isArchived = archived;
    }

    public Boolean getPinned() {
        return isPinned;
    }

    public void setPinned(Boolean pinned) {
        isPinned = pinned;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getUpdatedDate() {
        return updatedDate;
    }

    public void setUpdatedDate(LocalDateTime updatedDate) {
        this.updatedDate = updatedDate;
    }

    public UserDTO getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UserDTO createdBy) {
        this.createdBy = createdBy;
    }

    public List<ConversationParticipantDTO> getParticipants() {
        return participants;
    }

    public void setParticipants(List<ConversationParticipantDTO> participants) {
        this.participants = participants;
    }

    public MessageDTO getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(MessageDTO lastMessage) {
        this.lastMessage = lastMessage;
    }

    public Integer getUnreadMessagesCount() {
        return unreadMessagesCount;
    }

    public void setUnreadMessagesCount(Integer unreadMessagesCount) {
        this.unreadMessagesCount = unreadMessagesCount;
    }

    public Boolean getTyping() {
        return isTyping;
    }

    public void setTyping(Boolean typing) {
        isTyping = typing;
    }

    public List<String> getTypingUsers() {
        return typingUsers;
    }

    public void setTypingUsers(List<String> typingUsers) {
        this.typingUsers = typingUsers;
    }

    public List<GroupSettingDTO> getGroupSettings() {
        return groupSettings;
    }

    public void setGroupSettings(List<GroupSettingDTO> groupSettings) {
        this.groupSettings = groupSettings;
    }
}
