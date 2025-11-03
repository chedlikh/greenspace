package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Site;
import com.example.app.Entities.Societe;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.SiteRepo;
import com.example.app.Repository.SocieteRepo;
import com.example.app.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SiteService implements ISiteService{
    private final SiteRepo siteRepo;
    private final UserRepo userRepo;
    private final SocieteRepo societeRepo;
    private final GserviceRepository gserviceRepository;

    @Autowired
    public SiteService(SiteRepo siteRepo,UserRepo userRepo,SocieteRepo societeRepo, GserviceRepository gserviceRepository) {
        this.siteRepo = siteRepo;
        this.userRepo=userRepo;
        this.societeRepo=societeRepo;
        this.gserviceRepository=gserviceRepository;
    }
    @Override
    public Site createSite(Site site) {
        return siteRepo.save(site);
    }
    @Override
    public Site getSiteById(Long id) {
        return siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + id));
    }

    @Override
    public List<Site> getAllSites() {
        return siteRepo.findAll();
    }

    @Override
    public Site updateSite(Long id, Site site) {
        Site existingSite = siteRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + id));

        existingSite.setNom(site.getNom());
        existingSite.setAdresse(site.getAdresse());
        existingSite.setType(site.getType());

        return siteRepo.save(existingSite);
    }

    @Override
    public void deleteSite(Long id) {
        siteRepo.deleteById(id);
    }

    @Override
    public Set<Gservice> getServicesBySiteId(Long siteId) {
        Site site = getSiteById(siteId);
        return site.getGservices();
    }
    @Override
    public Site assignSiteToSociete(Long siteId, Long societeId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));
        Societe societe = societeRepo.findById(societeId)
                .orElseThrow(() -> new RuntimeException("Societe not found with id: " + societeId));

        societe.addSite(site); // This also sets the societe in the site
        societeRepo.save(societe); // Save the societe to persist the relationship
        return site;
    }
    @Override
    public Site assignSiteToService(Long siteId, Long gserviceId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));
        Gservice gservice = gserviceRepository.findById(gserviceId)
                .orElseThrow(() -> new RuntimeException("Gservice not found with id: " + gserviceId));

        gservice.assignSite(site); // This handles the bidirectional relationship
        gserviceRepository.save(gservice); // Save the gservice to persist the relationship
        return site;
    }
    @Override
    public Site unassignSiteFromSociete(Long siteId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));

        Societe societe = site.getSociete();
        if (societe != null) {
            societe.removeSite(site); // This also sets the societe in the site to null
            societeRepo.save(societe); // Save the societe to persist the relationship
        }
        return site;
    }

    @Override
    public Site unassignSiteFromService(Long siteId, Long gserviceId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));
        Gservice gservice = gserviceRepository.findById(gserviceId)
                .orElseThrow(() -> new RuntimeException("Gservice not found with id: " + gserviceId));

        gservice.unassignSite(site); // This handles the bidirectional relationship
        gserviceRepository.save(gservice); // Save the gservice to persist the relationship
        return site;
    }

    @Override
    public List<Societe> getUnassignedSocietes(Long siteId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));

        List<Societe> allSocietes = societeRepo.findAll();
        Societe currentSociete = site.getSociete();

        return allSocietes.stream()
                .filter(societe -> societe != currentSociete)
                .collect(Collectors.toList());
    }

    @Override
    public List<Gservice> getUnassignedServices(Long siteId) {
        Site site = siteRepo.findById(siteId)
                .orElseThrow(() -> new RuntimeException("Site not found with id: " + siteId));

        List<Gservice> allServices = gserviceRepository.findAll();
        Set<Gservice> assignedServices = site.getGservices();

        return allServices.stream()
                .filter(service -> !assignedServices.contains(service))
                .collect(Collectors.toList());
    }
    @Override
    public List<Site> getSitesBySocieteId(Long societeId) {
        return siteRepo.findBySocieteId(societeId);
    }



}
