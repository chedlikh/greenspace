package com.example.app.Entities;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Sondage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createDate;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SondageStatus status;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "sondage_gservice",
            joinColumns = @JoinColumn(name = "sondage_id"),
            inverseJoinColumns = @JoinColumn(name = "gservice_id")
    )
    private Set<Gservice> gservices = new HashSet<>();

    public enum SondageStatus {
        WILL_START_SOON,
        STARTED,
        FINISHED
    }

    @PrePersist
    public void prePersist() {
        this.createDate = LocalDateTime.now();
        updateStatus();
    }

    @PreUpdate
    public void preUpdate() {
        updateStatus();
    }

    public void updateStatus() {
        LocalDate now = LocalDate.now();

        if (now.isBefore(startDate)) {
            this.status = SondageStatus.WILL_START_SOON;
        } else if (now.isAfter(endDate)) {
            this.status = SondageStatus.FINISHED;
        } else {
            this.status = SondageStatus.STARTED;
        }
    }

    public void assignService(Gservice gservice) {
        this.gservices.add(gservice);
        gservice.getSondages().add(this);
    }

    public void unassignService(Gservice gservice) {
        this.gservices.remove(gservice);
        gservice.getSondages().remove(this);
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

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public SondageStatus getStatus() {
        return status;
    }

    public void setStatus(SondageStatus status) {
        this.status = status;
    }

    public Set<Gservice> getGservices() {
        return gservices;
    }

    public void setGservices(Set<Gservice> gservices) {
        this.gservices = gservices;
    }
}