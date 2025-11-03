package com.example.app.Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.Map;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String content;

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate;

    @Column
    private String conversationId;

    @Column
    private String callId;

    @Column
    private String metadata; // Store JSON string

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    // Transient field for Map access
    @Transient
    private Map<String, Object> metadataMap;

    // Jackson ObjectMapper for serialization/deserialization
    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Constructors
    public Notification() {}

    public Notification(Long id, User user, String type, String title, String content,
                        LocalDateTime createdDate, String conversationId, String callId,
                        Map<String, Object> metadata, boolean isRead) {
        this.id = id;
        this.user = user;
        this.type = type;
        this.title = title;
        this.content = content;
        this.createdDate = createdDate;
        this.conversationId = conversationId;
        this.callId = callId;
        setMetadataMap(metadata); // Convert Map to JSON string
        this.isRead = isRead;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getConversationId() { return conversationId; }
    public void setConversationId(String conversationId) { this.conversationId = conversationId; }
    public String getCallId() { return callId; }
    public void setCallId(String callId) { this.callId = callId; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }

    public Map<String, Object> getMetadataMap() {
        if (metadataMap == null && metadata != null) {
            try {
                metadataMap = objectMapper.readValue(metadata, new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                throw new RuntimeException("Failed to deserialize metadata", e);
            }
        }
        return metadataMap;
    }

    public void setMetadataMap(Map<String, Object> metadataMap) {
        this.metadataMap = metadataMap;
        try {
            this.metadata = metadataMap != null ? objectMapper.writeValueAsString(metadataMap) : null;
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize metadata", e);
        }
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
        this.metadataMap = null; // Reset transient map to force re-deserialization
    }
}