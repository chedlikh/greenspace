package com.example.app.DTOs;

import com.example.app.Entities.FormationMode;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class SessionDTO {
    private Long id;
    private LocalDate datedebut;
    private LocalDate datefin;
    private String objectifs;
    private String apport;
    private String affiche;
    private String theme;
    private Double prix;
    private FormationMode mode;
    private Long cabinetId;
    private Set<FormateurDTO> formateurs = new HashSet<>();
    private Set<ProgrammeDTO> programmes = new HashSet<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SessionDTO() {
    }

    public SessionDTO(Long id, LocalDate datedebut, LocalDate datefin, String objectifs, String apport, String affiche, String theme, Double prix, FormationMode mode, Long cabinetId, Set<FormateurDTO> formateurs, Set<ProgrammeDTO> programmes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.datedebut = datedebut;
        this.datefin = datefin;
        this.objectifs = objectifs;
        this.apport = apport;
        this.affiche = affiche;
        this.theme = theme;
        this.prix = prix;
        this.mode = mode;
        this.cabinetId = cabinetId;
        this.formateurs = formateurs;
        this.programmes = programmes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDatedebut() {
        return datedebut;
    }

    public void setDatedebut(LocalDate datedebut) {
        this.datedebut = datedebut;
    }

    public LocalDate getDatefin() {
        return datefin;
    }

    public void setDatefin(LocalDate datefin) {
        this.datefin = datefin;
    }

    public String getObjectifs() {
        return objectifs;
    }

    public void setObjectifs(String objectifs) {
        this.objectifs = objectifs;
    }

    public String getApport() {
        return apport;
    }

    public void setApport(String apport) {
        this.apport = apport;
    }

    public String getAffiche() {
        return affiche;
    }

    public void setAffiche(String affiche) {
        this.affiche = affiche;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public Double getPrix() {
        return prix;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }

    public FormationMode getMode() {
        return mode;
    }

    public void setMode(FormationMode mode) {
        this.mode = mode;
    }

    public Long getCabinetId() {
        return cabinetId;
    }

    public void setCabinetId(Long cabinetId) {
        this.cabinetId = cabinetId;
    }

    public Set<FormateurDTO> getFormateurs() {
        return formateurs;
    }

    public void setFormateurs(Set<FormateurDTO> formateurs) {
        this.formateurs = formateurs;
    }

    public Set<ProgrammeDTO> getProgrammes() {
        return programmes;
    }

    public void setProgrammes(Set<ProgrammeDTO> programmes) {
        this.programmes = programmes;
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
}