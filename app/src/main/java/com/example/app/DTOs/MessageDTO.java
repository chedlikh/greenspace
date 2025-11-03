package com.example.app.DTOs;

import com.example.app.Entities.Message;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data

public class MessageDTO {
    private Long id;
    private String content;
    private Message.MessageType type;
    private LocalDateTime sentDate;
    private LocalDateTime editedDate;
    private Boolean isEdited;
    private Boolean isDeleted;
    private Boolean isPinned;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Message.MessageType getType() {
        return type;
    }

    public void setType(Message.MessageType type) {
        this.type = type;
    }

    public LocalDateTime getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDateTime sentDate) {
        this.sentDate = sentDate;
    }

    public LocalDateTime getEditedDate() {
        return editedDate;
    }

    public void setEditedDate(LocalDateTime editedDate) {
        this.editedDate = editedDate;
    }

    public Boolean getEdited() {
        return isEdited;
    }

    public void setEdited(Boolean edited) {
        isEdited = edited;
    }

    public Boolean getDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public Boolean getPinned() {
        return isPinned;
    }

    public void setPinned(Boolean pinned) {
        isPinned = pinned;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public UserDTO getSender() {
        return sender;
    }

    public void setSender(UserDTO sender) {
        this.sender = sender;
    }

    public MessageDTO getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(MessageDTO replyTo) {
        this.replyTo = replyTo;
    }

    public List<MessageAttachmentDTO> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<MessageAttachmentDTO> attachments) {
        this.attachments = attachments;
    }

    public List<MessageStatusDTO> getStatuses() {
        return statuses;
    }

    public void setStatuses(List<MessageStatusDTO> statuses) {
        this.statuses = statuses;
    }

    public List<MessageReactionDTO> getReactions() {
        return reactions;
    }

    public void setReactions(List<MessageReactionDTO> reactions) {
        this.reactions = reactions;
    }

    public Integer getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(Integer unreadCount) {
        this.unreadCount = unreadCount;
    }

    private Long conversationId;
    private UserDTO sender;
    private MessageDTO replyTo;
    private List<MessageAttachmentDTO> attachments;
    private List<MessageStatusDTO> statuses;
    private List<MessageReactionDTO> reactions;
    private Integer unreadCount;

    public MessageDTO(Long id, String content, Message.MessageType type, LocalDateTime sentDate, LocalDateTime editedDate, Boolean isEdited, Boolean isDeleted, Boolean isPinned, Long conversationId, UserDTO sender, MessageDTO replyTo, List<MessageAttachmentDTO> attachments, List<MessageStatusDTO> statuses, List<MessageReactionDTO> reactions, Integer unreadCount) {
        this.id = id;
        this.content = content;
        this.type = type;
        this.sentDate = sentDate;
        this.editedDate = editedDate;
        this.isEdited = isEdited;
        this.isDeleted = isDeleted;
        this.isPinned = isPinned;
        this.conversationId = conversationId;
        this.sender = sender;
        this.replyTo = replyTo;
        this.attachments = attachments;
        this.statuses = statuses;
        this.reactions = reactions;
        this.unreadCount = unreadCount;
    }

    public MessageDTO() {
    }
}
