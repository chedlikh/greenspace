package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CabinetDTO {
    private Long id;
    private String nom;
    private String adresse;
    private String logo;
    private String tel;
    private String catalogue;
    private String motscles;
    private String description;
    private Integer duree;
    private Long formationId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getLogo() {
        return logo;
    }

    public void setLogo(String logo) {
        this.logo = logo;
    }

    public String getTel() {
        return tel;
    }

    public void setTel(String tel) {
        this.tel = tel;
    }

    public String getCatalogue() {
        return catalogue;
    }

    public void setCatalogue(String catalogue) {
        this.catalogue = catalogue;
    }

    public String getMotscles() {
        return motscles;
    }

    public void setMotscles(String motscles) {
        this.motscles = motscles;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDuree() {
        return duree;
    }

    public void setDuree(Integer duree) {
        this.duree = duree;
    }

    public Long getFormationId() {
        return formationId;
    }

    public void setFormationId(Long formationId) {
        this.formationId = formationId;
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

    public CabinetDTO(Long id, String nom, String adresse, String logo, String tel, String catalogue, String motscles, String description, Integer duree, Long formationId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.nom = nom;
        this.adresse = adresse;
        this.logo = logo;
        this.tel = tel;
        this.catalogue = catalogue;
        this.motscles = motscles;
        this.description = description;
        this.duree = duree;
        this.formationId = formationId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public CabinetDTO() {
    }
}