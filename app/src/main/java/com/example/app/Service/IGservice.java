package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Entities.Site;

import java.util.List;
import java.util.Set;

public interface IGservice {
    List<Gservice> getAllGservices();
    Gservice getGserviceById(Long id);
    Gservice createGservice(Gservice gservice);
    Gservice updateGservice(Long id, Gservice gservice);
    void deleteGservice(Long id);
    void assignSiteToGservice(Long gserviceId, Long siteId);
    void unassignSiteFromGservice(Long gserviceId, Long siteId);
    List<Site> findAvailableSites(Long gserviceId);
    Set<Poste> getPosteByServiceId(Long serviceId);


}
