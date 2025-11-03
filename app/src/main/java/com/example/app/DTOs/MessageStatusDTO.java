package com.example.app.DTOs;

import com.example.app.Entities.MessageStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data

public class MessageStatusDTO {
    private Long id;
    private Long messageId;
    private Long userId;
    private MessageStatus.Status status;
    private LocalDateTime statusDate;

    public MessageStatusDTO() {
    }

    public MessageStatusDTO(Long id, Long messageId, Long userId, MessageStatus.Status status, LocalDateTime statusDate) {
        this.id = id;
        this.messageId = messageId;
        this.userId = userId;
        this.status = status;
        this.statusDate = statusDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public MessageStatus.Status getStatus() {
        return status;
    }

    public void setStatus(MessageStatus.Status status) {
        this.status = status;
    }

    public LocalDateTime getStatusDate() {
        return statusDate;
    }

    public void setStatusDate(LocalDateTime statusDate) {
        this.statusDate = statusDate;
    }
}
