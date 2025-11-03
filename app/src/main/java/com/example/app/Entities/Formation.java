package com.example.app.Entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Data
@EntityListeners(AuditingEntityListener.class)
public class Formation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String titre;

    @NotBlank
    private String description;

    private LocalDate datedebut; // Derived from earliest session's program start date

    private LocalDate datefin; // Derived from latest session's program end date

    private String affiche; // Concatenated session images


    private Double prix; // Sum of session prices

    @Enumerated(EnumType.STRING)
    private FormationStatus status; // Derived based on dates

    @Enumerated(EnumType.STRING)
    private FormationMode mode; // Derived from sessions

    private String objectif; // Concatenated from sessions

    private String apport; // Concatenated from sessions

    private String type; // Calculated from program hours

    private Integer duree; // Calculated from program hours

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "formation_poste",
            joinColumns = @JoinColumn(name = "formation_id"),
            inverseJoinColumns = @JoinColumn(name = "poste_id")
    )
    private Set<Poste> postes = new HashSet<>();

    @OneToMany(mappedBy = "formation", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Cabinet> cabinets = new HashSet<>();

    @PrePersist
    @PreUpdate
    private void validateDates() {
        if (datedebut != null && datefin != null && datefin.isBefore(datedebut)) {
            throw new IllegalArgumentException("datefin must be after datedebut");
        }
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

    public Set<Poste> getPostes() {
        return postes;
    }

    public void setPostes(Set<Poste> postes) {
        this.postes = postes;
    }

    public Set<Cabinet> getCabinets() {
        return cabinets;
    }

    public void setCabinets(Set<Cabinet> cabinets) {
        this.cabinets = cabinets;
    }
}