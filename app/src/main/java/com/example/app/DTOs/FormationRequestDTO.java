package com.example.app.DTOs;

import com.example.app.Entities.DemandeStatus;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FormationRequestDTO {
    private Long id;
    private Long userId;
    private String titre;
    private String description;
    private String objectif;
    private String apport;
    private String type;
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

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getObjectif() {
        return objectif;
    }

    public void setObjectif(String objectif) {
        this.objectif = objectif;
    }

    public String getApport() {
        return apport;
    }

    public void setApport(String apport) {
        this.apport = apport;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
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

    public FormationRequestDTO(Long id, Long userId, String titre, String description, String objectif, String apport, String type, DemandeStatus status, Long adminId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.titre = titre;
        this.description = description;
        this.objectif = objectif;
        this.apport = apport;
        this.type = type;
        this.status = status;
        this.adminId = adminId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public FormationRequestDTO() {
    }
}