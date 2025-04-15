package com.example.app.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
public class Site {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @JsonProperty("nom")
    @Column(nullable = false)
    private String nom;


    @JsonProperty("adresse")
    @Column(nullable = false)
    private String adresse;


    @JsonProperty("type")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeSite type;
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "societe_id")
    @JsonIgnoreProperties("sites")
    private Societe societe;



    @ManyToMany(mappedBy = "sites", fetch = FetchType.EAGER)
    @JsonIgnoreProperties("sites")
    private Set<Gservice> gservices = new HashSet<>();

    public Set<Gservice> getGservices() {
        return gservices;
    }

    public void setGservices(Set<Gservice> gservices) {
        this.gservices = gservices;
    }

    public Societe getSociete() {
        return societe;
    }

    public void setSociete(Societe societe) {
        this.societe = societe;
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
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

    public TypeSite getType() {
        return type;
    }

    public void setType(TypeSite type) {
        this.type = type;
    }


}
