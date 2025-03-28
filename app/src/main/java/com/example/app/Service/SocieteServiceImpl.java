package com.example.app.Service;

import com.example.app.Entities.Site;
import com.example.app.Entities.Societe;
import com.example.app.Repository.SiteRepo;
import com.example.app.Repository.SocieteRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SocieteServiceImpl implements ISocieteService {

    @Autowired
    private SocieteRepo societeRepository;

    @Autowired
    private SiteRepo siteRepository;

    @Override
    public Societe createSociete(Societe societe) {
        return societeRepository.save(societe);
    }

    @Override
    public Societe updateSociete(Long id, Societe societe) {
        Societe existingSociete = societeRepository.findById(id).orElseThrow(() -> new RuntimeException("Societe not found"));
        existingSociete.setName(societe.getName());
        existingSociete.setType(societe.getType());
        existingSociete.setAdresse(societe.getAdresse());
        return societeRepository.save(existingSociete);
    }

    @Override
    public void deleteSociete(Long id) {
        societeRepository.deleteById(id);
    }

    @Override
    public Societe getSocieteById(Long id) {
        return societeRepository.findById(id).orElseThrow(() -> new RuntimeException("Societe not found"));
    }

    @Override
    public List<Societe> getAllSocietes() {
        return societeRepository.findAll();
    }

    @Override
    public Societe assignSiteToSociete(Long societeId, Long siteId) {
        Societe societe = societeRepository.findById(societeId).orElseThrow(() -> new RuntimeException("Societe not found"));
        Site site = siteRepository.findById(siteId).orElseThrow(() -> new RuntimeException("Site not found"));
        societe.addSite(site);
        return societeRepository.save(societe);
    }

    @Override
    @Transactional
    public Societe unassignSiteFromSociete(Long societeId, Long siteId) {
        Societe societe = societeRepository.findById(societeId)
                .orElseThrow(() -> new EntityNotFoundException("Societe not found with id: " + societeId));

        Site site = siteRepository.findById(siteId)
                .orElseThrow(() -> new EntityNotFoundException("Site not found with id: " + siteId));

        // Unassign the site from the societe
        societe.removeSite(site);

        // Save the updated societe (this will cascade the changes to the site)
        return societeRepository.save(societe);
    }
    @Override
    public List<Site> getSitesBySocieteId(Long societeId) {
        Societe societe = societeRepository.findById(societeId)
                .orElseThrow(() -> new EntityNotFoundException("Societe not found with id: " + societeId));

        return new ArrayList<>(societe.getSites());
    }
}
