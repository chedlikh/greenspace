package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageSearchDTO {
    private String query;
    private Long conversationId;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String messageType;

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public LocalDateTime getFromDate() {
        return fromDate;
    }

    public void setFromDate(LocalDateTime fromDate) {
        this.fromDate = fromDate;
    }

    public LocalDateTime getToDate() {
        return toDate;
    }

    public void setToDate(LocalDateTime toDate) {
        this.toDate = toDate;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getSize() {
        return size;
    }

    public void setSize(int size) {
        this.size = size;
    }

    private Long senderId;
    private int page = 0;
    private int size = 20;

    public MessageSearchDTO(String query, Long conversationId, LocalDateTime fromDate, LocalDateTime toDate, String messageType, Long senderId, int page, int size) {
        this.query = query;
        this.conversationId = conversationId;
        this.fromDate = fromDate;
        this.toDate = toDate;
        this.messageType = messageType;
        this.senderId = senderId;
        this.page = page;
        this.size = size;
    }

    public MessageSearchDTO() {
    }
}
