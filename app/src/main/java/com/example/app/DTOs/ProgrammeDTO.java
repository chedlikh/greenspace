package com.example.app.DTOs;

import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class ProgrammeDTO {
    private Long id;
    private String titre;
    private Integer duree;
    private Integer nbrdheureparjour;
    private LocalTime heuredebut;
    private LocalTime heurefin;
    private Long sessionId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ProgrammeDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public Integer getDuree() {
        return duree;
    }

    public void setDuree(Integer duree) {
        this.duree = duree;
    }

    public Integer getNbrdheureparjour() {
        return nbrdheureparjour;
    }

    public void setNbrdheureparjour(Integer nbrdheureparjour) {
        this.nbrdheureparjour = nbrdheureparjour;
    }

    public LocalTime getHeuredebut() {
        return heuredebut;
    }

    public void setHeuredebut(LocalTime heuredebut) {
        this.heuredebut = heuredebut;
    }

    public LocalTime getHeurefin() {
        return heurefin;
    }

    public void setHeurefin(LocalTime heurefin) {
        this.heurefin = heurefin;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
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

    public ProgrammeDTO(Long id, String titre, Integer duree, Integer nbrdheureparjour, LocalTime heuredebut, LocalTime heurefin, Long sessionId, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.titre = titre;
        this.duree = duree;
        this.nbrdheureparjour = nbrdheureparjour;
        this.heuredebut = heuredebut;
        this.heurefin = heurefin;
        this.sessionId = sessionId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
}