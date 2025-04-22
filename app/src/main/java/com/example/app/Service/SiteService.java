package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Site;
import com.example.app.Entities.User;
import com.example.app.Repository.SiteRepo;
import com.example.app.Repository.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class SiteService implements ISiteService{
    private final SiteRepo siteRepo;
    private final UserRepo userRepo;

    @Autowired
    public SiteService(SiteRepo siteRepo,UserRepo userRepo) {
        this.siteRepo = siteRepo;
        this.userRepo=userRepo;
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



}
