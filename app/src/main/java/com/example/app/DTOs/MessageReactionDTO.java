package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageReactionDTO {
    private Long id;
    private UserDTO user;
    private String emoji;

    public Long getMessageId() {
        return messageId;
    }

    public MessageReactionDTO(Long id, UserDTO user, String emoji, LocalDateTime createdDate, Long messageId) {
        this.id = id;
        this.user = user;
        this.emoji = emoji;
        this.createdDate = createdDate;
        this.messageId = messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    private LocalDateTime createdDate;
    private Long messageId; // Added field to reference the message

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public MessageReactionDTO(Long id, UserDTO user, String emoji, LocalDateTime createdDate) {
        this.id = id;
        this.user = user;
        this.emoji = emoji;
        this.createdDate = createdDate;
    }

    public MessageReactionDTO() {
    }
}
