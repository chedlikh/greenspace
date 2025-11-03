package com.example.app.Entities;

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
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate datedebut; // Derived from earliest program start date

    private LocalDate datefin; // Derived from latest program end date

    @NotBlank
    private String objectifs;

    @NotBlank
    private String apport;

    private String affiche; // URL for poster/image

    @NotBlank
    private String theme;

    @Positive
    private Double prix;

    @Enumerated(EnumType.STRING)
    private FormationMode mode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cabinet_id")
    private Cabinet cabinet;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "session_formateur",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "formateur_id")
    )
    private Set<Formateur> formateurs = new HashSet<>();

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Programme> programmes = new HashSet<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

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

    public Cabinet getCabinet() {
        return cabinet;
    }

    public void setCabinet(Cabinet cabinet) {
        this.cabinet = cabinet;
    }

    public Set<Formateur> getFormateurs() {
        return formateurs;
    }

    public void setFormateurs(Set<Formateur> formateurs) {
        this.formateurs = formateurs;
    }

    public Set<Programme> getProgrammes() {
        return programmes;
    }

    public void setProgrammes(Set<Programme> programmes) {
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