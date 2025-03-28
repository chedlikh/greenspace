package com.example.app.Service;

import com.example.app.Entities.Site;
import com.example.app.Entities.Societe;

import java.util.List;

public interface ISocieteService {
    Societe createSociete(Societe societe);
    Societe updateSociete(Long id, Societe societe);
    void deleteSociete(Long id);
    Societe getSocieteById(Long id);
    List<Societe> getAllSocietes();
    Societe assignSiteToSociete(Long societeId, Long siteId);
    Societe unassignSiteFromSociete(Long societeId, Long siteId);
    List<Site> getSitesBySocieteId(Long societeId);

}
