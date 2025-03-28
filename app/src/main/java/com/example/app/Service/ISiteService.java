package com.example.app.Service;

import com.example.app.Entities.Site;

import java.util.List;

public interface ISiteService {
    Site createSite(Site site);
    Site getSiteById(Long id);
    List<Site> getAllSites();
    Site updateSite(Long id, Site site);
    void deleteSite(Long id);
     Site assignUsersToSite(Long siteId, List<String> usernames);
     Site unassignUsersFromSite(Long siteId, List<String> usernames);
}
