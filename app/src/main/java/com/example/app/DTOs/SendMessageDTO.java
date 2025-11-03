package com.example.app.DTOs;

import com.example.app.Entities.Message;
import lombok.Data;

@Data

public class SendMessageDTO {
    private String content;
    private Message.MessageType type;
    private Long replyToId;
    private Long conversationId;

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

    public Long getReplyToId() {
        return replyToId;
    }

    public void setReplyToId(Long replyToId) {
        this.replyToId = replyToId;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public SendMessageDTO(String content, Message.MessageType type, Long replyToId, Long conversationId) {
        this.content = content;
        this.type = type;
        this.replyToId = replyToId;
        this.conversationId = conversationId;
    }

    public SendMessageDTO() {
    }
}
