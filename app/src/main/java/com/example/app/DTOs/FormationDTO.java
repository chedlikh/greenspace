package com.example.app.DTOs;

import com.example.app.Entities.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
public class FormationDTO {
    private Long id;
    private String titre;
    private String description;
    private LocalDate datedebut;
    private LocalDate datefin;
    private String affiche;
    private Double prix;
    private FormationStatus status;
    private FormationMode mode;
    private String objectif;
    private String apport;
    private String type;
    private Integer duree;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<PosteDTO> postes;
    private Set<CabinetDTO> cabinets;
    private Set<SessionDTO> sessions;
    private Set<DemandeDTO> demandes;
    private Set<FormationRequestDTO> formationRequests;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public String getAffiche() {
        return affiche;
    }

    public void setAffiche(String affiche) {
        this.affiche = affiche;
    }

    public Double getPrix() {
        return prix;
    }

    public void setPrix(Double prix) {
        this.prix = prix;
    }

    public FormationStatus getStatus() {
        return status;
    }

    public void setStatus(FormationStatus status) {
        this.status = status;
    }

    public FormationMode getMode() {
        return mode;
    }

    public void setMode(FormationMode mode) {
        this.mode = mode;
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

    public Integer getDuree() {
        return duree;
    }

    public void setDuree(Integer duree) {
        this.duree = duree;
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

    public Set<PosteDTO> getPostes() {
        return postes;
    }

    public void setPostes(Set<PosteDTO> postes) {
        this.postes = postes;
    }

    public Set<CabinetDTO> getCabinets() {
        return cabinets;
    }

    public void setCabinets(Set<CabinetDTO> cabinets) {
        this.cabinets = cabinets;
    }

    public Set<SessionDTO> getSessions() {
        return sessions;
    }

    public void setSessions(Set<SessionDTO> sessions) {
        this.sessions = sessions;
    }

    public Set<DemandeDTO> getDemandes() {
        return demandes;
    }

    public void setDemandes(Set<DemandeDTO> demandes) {
        this.demandes = demandes;
    }

    public Set<FormationRequestDTO> getFormationRequests() {
        return formationRequests;
    }

    public void setFormationRequests(Set<FormationRequestDTO> formationRequests) {
        this.formationRequests = formationRequests;
    }

    public FormationDTO(Long id, String titre, String description, LocalDate datedebut, LocalDate datefin, String affiche, Double prix, FormationStatus status, FormationMode mode, String objectif, String apport, String type, Integer duree, LocalDateTime createdAt, LocalDateTime updatedAt, Set<PosteDTO> postes, Set<CabinetDTO> cabinets, Set<SessionDTO> sessions, Set<DemandeDTO> demandes, Set<FormationRequestDTO> formationRequests) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.datedebut = datedebut;
        this.datefin = datefin;
        this.affiche = affiche;
        this.prix = prix;
        this.status = status;
        this.mode = mode;
        this.objectif = objectif;
        this.apport = apport;
        this.type = type;
        this.duree = duree;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.postes = postes;
        this.cabinets = cabinets;
        this.sessions = sessions;
        this.demandes = demandes;
        this.formationRequests = formationRequests;
    }

    public FormationDTO() {
    }
}