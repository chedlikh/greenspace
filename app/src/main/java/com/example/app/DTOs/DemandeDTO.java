package com.example.app.DTOs;

import com.example.app.Entities.DemandeStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DemandeDTO {
    private Long id;
    private Long userId;
    private Long sessionId;
    private DemandeStatus status;
    private Long adminId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public DemandeStatus getStatus() {
        return status;
    }

    public void setStatus(DemandeStatus status) {
        this.status = status;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public DemandeDTO(Long id, Long userId, Long sessionId, DemandeStatus status, Long adminId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.sessionId = sessionId;
        this.status = status;
        this.adminId = adminId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public DemandeDTO() {
    }
}