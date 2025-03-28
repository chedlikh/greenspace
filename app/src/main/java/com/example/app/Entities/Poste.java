package com.example.app.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Poste {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String titre;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "poste_gservice",
            joinColumns = @JoinColumn(name = "poste_id"),
            inverseJoinColumns = @JoinColumn(name = "gservice_id")
    )
    @JsonIgnore
    private Set<Gservice> gservices = new HashSet<>();

    public void assignService(Gservice gservice) {
        this.gservices.add(gservice);
        gservice.getPostes().add(this);
    }

    public void unassignService(Gservice gservice) {
        this.gservices.remove(gservice);
        gservice.getPostes().remove(this);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public Set<Gservice> getGservices() {
        return gservices;
    }

    public void setGservices(Set<Gservice> gservices) {
        this.gservices = gservices;
    }
}