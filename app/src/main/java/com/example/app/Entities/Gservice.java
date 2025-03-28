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
public class Gservice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
            name = "gservice_site",
            joinColumns = @JoinColumn(name = "gservice_id"),
            inverseJoinColumns = @JoinColumn(name = "site_id")
    )
    @JsonIgnore
    private Set<Site> sites = new HashSet<>();

    @ManyToMany(mappedBy = "gservices", fetch = FetchType.LAZY)
    private Set<Poste> postes = new HashSet<>();

    @ManyToMany(mappedBy = "gservices", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Sondage> sondages = new HashSet<>();

    public Set<Sondage> getSondages() {
        return sondages;
    }

    public void setSondages(Set<Sondage> sondages) {
        this.sondages = sondages;
    }

    public Set<Poste> getPostes() {
        return postes;
    }

    public void setPostes(Set<Poste> postes) {
        this.postes = postes;
    }

    public void assignSite(Site site) {
        this.sites.add(site);
        site.getGservices().add(this);
    }

    public void unassignSite(Site site) {
        this.sites.remove(site);
        site.getGservices().remove(this);
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Set<Site> getSites() {
        return sites;
    }

    public void setSites(Set<Site> sites) {
        this.sites = sites;
    }
}