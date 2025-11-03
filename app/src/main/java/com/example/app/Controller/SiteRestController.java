package com.example.app.Controller;

import com.example.app.Entities.*;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ISiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/Site")
public class SiteRestController {

    final
    ISiteService siteService;
    UserRepo userRepo;

    public SiteRestController(ISiteService siteService, UserRepo userRepo) {
        this.siteService = siteService;
        this.userRepo=userRepo;
    }

    @PostMapping
    public ResponseEntity<Site> createSite(@RequestBody Site site) {
        Site createdSite = siteService.createSite(site);
        return new ResponseEntity<>(createdSite, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Site> getSiteById(@PathVariable Long id) {
        Site site = siteService.getSiteById(id);
        return new ResponseEntity<>(site, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Site>> getAllSites() {
        List<Site> sites = siteService.getAllSites();
        return new ResponseEntity<>(sites, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Site> updateSite(@PathVariable Long id, @RequestBody Site site) {
        Site updatedSite = siteService.updateSite(id, site);
        return new ResponseEntity<>(updatedSite, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSite(@PathVariable Long id) {
        siteService.deleteSite(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @GetMapping("/{siteId}/services")
    public ResponseEntity<Set<Gservice>> getServicesByPosteId(@PathVariable Long siteId) {
        return ResponseEntity.ok(siteService.getServicesBySiteId(siteId));
    }
    @PostMapping("/{siteId}/societe/{societeId}")
    public ResponseEntity<Site> assignSiteToSociete(@PathVariable Long siteId, @PathVariable Long societeId) {
        Site updatedSite = siteService.assignSiteToSociete(siteId, societeId);
        return new ResponseEntity<>(updatedSite, HttpStatus.OK);
    }

    @PostMapping("/{siteId}/service/{gserviceId}")
    public ResponseEntity<Site> assignSiteToService(@PathVariable Long siteId, @PathVariable Long gserviceId) {
        Site updatedSite = siteService.assignSiteToService(siteId, gserviceId);
        return new ResponseEntity<>(updatedSite, HttpStatus.OK);
    }
    @DeleteMapping("/{siteId}/societe")
    public ResponseEntity<Site> unassignSiteFromSociete(@PathVariable Long siteId) {
        Site updatedSite = siteService.unassignSiteFromSociete(siteId);
        return new ResponseEntity<>(updatedSite, HttpStatus.OK);
    }

    @DeleteMapping("/{siteId}/service/{gserviceId}")
    public ResponseEntity<Site> unassignSiteFromService(@PathVariable Long siteId, @PathVariable Long gserviceId) {
        Site updatedSite = siteService.unassignSiteFromService(siteId, gserviceId);
        return new ResponseEntity<>(updatedSite, HttpStatus.OK);
    }

    @GetMapping("/{siteId}/unassigned-societes")
    public ResponseEntity<List<Societe>> getUnassignedSocietes(@PathVariable Long siteId) {
        List<Societe> unassignedSocietes = siteService.getUnassignedSocietes(siteId);
        return new ResponseEntity<>(unassignedSocietes, HttpStatus.OK);
    }

    @GetMapping("/{siteId}/unassigned-services")
    public ResponseEntity<List<Gservice>> getUnassignedServices(@PathVariable Long siteId) {
        List<Gservice> unassignedServices = siteService.getUnassignedServices(siteId);
        return new ResponseEntity<>(unassignedServices, HttpStatus.OK);
    }
    @GetMapping("/societe/{societeId}")
    public ResponseEntity<List<Site>> getSitesBySocieteId(@PathVariable Long societeId) {
        List<Site> sites = siteService.getSitesBySocieteId(societeId);
        return new ResponseEntity<>(sites, HttpStatus.OK);
    }


}
