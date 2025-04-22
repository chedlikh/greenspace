package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Entities.Site;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.SiteRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class GserviceServiceImpl implements IGservice {

    @Autowired
    private GserviceRepository gserviceRepository;

    @Autowired
    private SiteRepo siteRepository;

    @Override
    public List<Gservice> getAllGservices() {
        return gserviceRepository.findAll();
    }

    @Override
    public Gservice getGserviceById(Long id) {
        return gserviceRepository.findById(id).orElseThrow(() -> new RuntimeException("Gservice not found"));
    }

    @Override
    public Gservice createGservice(Gservice gservice) {
        return gserviceRepository.save(gservice);
    }

    @Override
    public Gservice updateGservice(Long id, Gservice gservice) {
        Gservice existingGservice = getGserviceById(id);
        existingGservice.setName(gservice.getName());
        existingGservice.setDescription(gservice.getDescription());
        return gserviceRepository.save(existingGservice);
    }

    @Override
    public void deleteGservice(Long id) {
        gserviceRepository.deleteById(id);
    }

    @Override
    public void assignSiteToGservice(Long gserviceId, Long siteId) {
        Gservice gservice = getGserviceById(gserviceId);
        Site site = siteRepository.findById(siteId).orElseThrow(() -> new RuntimeException("Site not found"));
        gservice.assignSite(site);
        gserviceRepository.save(gservice);
    }

    @Override
    public void unassignSiteFromGservice(Long gserviceId, Long siteId) {
        Gservice gservice = getGserviceById(gserviceId);
        Site site = siteRepository.findById(siteId).orElseThrow(() -> new RuntimeException("Site not found"));
        gservice.unassignSite(site);
        gserviceRepository.save(gservice);
    }
    public List<Site> findAvailableSites(Long gserviceId) {
        // Get the Gservice
        Gservice gservice = gserviceRepository.findById(gserviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Gservice not found"));

        // Get all sites and assigned sites
        List<Site> allSites = siteRepository.findAll();
        Set<Site> assignedSites = gservice.getSites();

        // Filter out assigned sites
        return allSites.stream()
                .filter(site -> !assignedSites.contains(site))
                .collect(Collectors.toList());
    }
    public class ResourceNotFoundException extends RuntimeException {
        public ResourceNotFoundException(String message) {
            super(message);
        }
    }
    @Override
    public Set<Poste> getPosteByServiceId(Long serviceId) {
        Gservice gservice = getGserviceById(serviceId);
        return gservice.getPostes();
    }


}