package com.example.app.Controller;

import com.example.app.Entities.Site;
import com.example.app.Entities.Societe;
import com.example.app.Service.SocieteServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/societes")
public class SocieteController {

    @Autowired
    private SocieteServiceImpl societeService;

    @PostMapping
    public ResponseEntity<Societe> createSociete(@RequestBody Societe societe) {
        return ResponseEntity.ok(societeService.createSociete(societe));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Societe> updateSociete(@PathVariable Long id, @RequestBody Societe societe) {
        return ResponseEntity.ok(societeService.updateSociete(id, societe));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSociete(@PathVariable Long id) {
        societeService.deleteSociete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Societe> getSocieteById(@PathVariable Long id) {
        return ResponseEntity.ok(societeService.getSocieteById(id));
    }

    @GetMapping
    public ResponseEntity<List<Societe>> getAllSocietes() {
        return ResponseEntity.ok(societeService.getAllSocietes());
    }

    @GetMapping("/{societeId}/sites")
    public ResponseEntity<List<Site>> getSitesBySocieteId(@PathVariable Long societeId) {
        try {
            List<Site> sites = societeService.getSitesBySocieteId(societeId);
            return new ResponseEntity<>(sites, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PostMapping("/{societeId}/sites/{siteId}")
    public ResponseEntity<Societe> assignSiteToSociete(@PathVariable Long societeId, @PathVariable Long siteId) {
        return ResponseEntity.ok(societeService.assignSiteToSociete(societeId, siteId));
    }

    @DeleteMapping("/{societeId}/sites/{siteId}")
    public ResponseEntity<Societe> unassignSiteFromSociete(@PathVariable Long societeId, @PathVariable Long siteId) {
        try {
            Societe societe = societeService.unassignSiteFromSociete(societeId, siteId);
            return new ResponseEntity<>(societe, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}