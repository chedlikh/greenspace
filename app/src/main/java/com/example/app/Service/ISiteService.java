package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Site;

import java.util.List;
import java.util.Set;

public interface ISiteService {
    Site createSite(Site site);
    Site getSiteById(Long id);
    List<Site> getAllSites();
    Site updateSite(Long id, Site site);
    void deleteSite(Long id);
    Set<Gservice> getServicesBySiteId(Long siteId);

}
