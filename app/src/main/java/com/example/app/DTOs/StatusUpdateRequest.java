package com.example.app.DTOs;

import com.example.app.Entities.MessageStatus;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    private Long messageId;
    private Long conversationId;
    private MessageStatus.Status status;

    public StatusUpdateRequest(Long messageId, Long conversationId, MessageStatus.Status status) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.status = status;
    }

    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public MessageStatus.Status getStatus() {
        return status;
    }

    public void setStatus(MessageStatus.Status status) {
        this.status = status;
    }

    public StatusUpdateRequest() {
    }
}
