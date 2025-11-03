package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Site;
import com.example.app.Entities.Societe;

import java.util.List;
import java.util.Set;

public interface ISiteService {
    Site createSite(Site site);
    Site getSiteById(Long id);
    List<Site> getAllSites();
    Site updateSite(Long id, Site site);
    void deleteSite(Long id);
    Set<Gservice> getServicesBySiteId(Long siteId);

    Site assignSiteToSociete(Long siteId, Long societeId);

    Site assignSiteToService(Long siteId, Long gserviceId);
    Site unassignSiteFromSociete(Long siteId);
    Site unassignSiteFromService(Long siteId, Long gserviceId);
    List<Societe> getUnassignedSocietes(Long siteId);
    List<Gservice> getUnassignedServices(Long siteId);
    List<Site> getSitesBySocieteId(Long societeId);

}
