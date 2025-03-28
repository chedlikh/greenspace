package com.example.app.Controller;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Sondage;
import com.example.app.Service.ISondageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/sondages")
public class SondageController {

    private final ISondageService sondageService;

    @Autowired
    public SondageController(ISondageService sondageService) {
        this.sondageService = sondageService;
    }

    @PostMapping
    public ResponseEntity<Sondage> createSondage(@RequestBody Sondage sondage) {
        Sondage createdSondage = sondageService.createSondage(sondage);
        return new ResponseEntity<>(createdSondage, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Sondage> updateSondage(@PathVariable Long id, @RequestBody Sondage sondage) {
        sondage.setId(id);
        Sondage updatedSondage = sondageService.updateSondage(sondage);
        return new ResponseEntity<>(updatedSondage, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSondage(@PathVariable Long id) {
        sondageService.deleteSondage(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sondage> getSondageById(@PathVariable Long id) {
        Sondage sondage = sondageService.getSondageById(id);
        return new ResponseEntity<>(sondage, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Sondage>> getAllSondages() {
        List<Sondage> sondages = sondageService.getAllSondages();
        return new ResponseEntity<>(sondages, HttpStatus.OK);
    }

    @PostMapping("/{sondageId}/services/{serviceId}")
    public ResponseEntity<Sondage> assignServiceToSondage(
            @PathVariable Long sondageId,
            @PathVariable Long serviceId) {
        Sondage sondage = sondageService.assignServiceToSondage(sondageId, serviceId);
        return new ResponseEntity<>(sondage, HttpStatus.OK);
    }

    @DeleteMapping("/{sondageId}/services/{serviceId}")
    public ResponseEntity<Sondage> unassignServiceFromSondage(
            @PathVariable Long sondageId,
            @PathVariable Long serviceId) {
        Sondage sondage = sondageService.unassignServiceFromSondage(sondageId, serviceId);
        return new ResponseEntity<>(sondage, HttpStatus.OK);
    }

    @GetMapping("/{sondageId}/services")
    public ResponseEntity<Set<Gservice>> getServicesBySondageId(@PathVariable Long sondageId) {
        Set<Gservice> services = sondageService.getServicesBySondageId(sondageId);
        return new ResponseEntity<>(services, HttpStatus.OK);
    }
}
