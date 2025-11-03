package com.example.app.DTOs;

import java.time.LocalDateTime;
import java.util.Map;

public class NotificationDTO {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String content;
    private Map<String, Object> metadata;
    private LocalDateTime createdDate;
    private boolean read;

    // Default constructor
    public NotificationDTO() {}

    // Constructor for notifications
    public NotificationDTO(Long id, Long userId, String type, String title, String content,
                           Map<String, Object> metadata, LocalDateTime createdDate, boolean read) {
        this.id = id;
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.content = content;
        this.metadata = metadata;
        this.createdDate = createdDate;
        this.read = read;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public boolean isRead() { return read; }
    public void setRead(boolean read) { this.read = read; }
}