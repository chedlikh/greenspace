package com.example.app.Controller;


import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Entities.Site;
import com.example.app.Service.GserviceServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/gservices")
public class GserviceController {

    @Autowired
    private GserviceServiceImpl gserviceService;

    @GetMapping
    public List<Gservice> getAllGservices() {
        return gserviceService.getAllGservices();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gservice> getGserviceById(@PathVariable Long id) {
        return ResponseEntity.ok(gserviceService.getGserviceById(id));
    }

    @PostMapping
    public ResponseEntity<Gservice> createGservice(@RequestBody Gservice gservice) {
        return ResponseEntity.ok(gserviceService.createGservice(gservice));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gservice> updateGservice(@PathVariable Long id, @RequestBody Gservice gservice) {
        return ResponseEntity.ok(gserviceService.updateGservice(id, gservice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGservice(@PathVariable Long id) {
        gserviceService.deleteGservice(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{gserviceId}/assign-site/{siteId}")
    public ResponseEntity<Map<String, String>> assignSiteToGservice(@PathVariable Long gserviceId, @PathVariable Long siteId) {
        gserviceService.assignSiteToGservice(gserviceId, siteId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Site assigned successfully"));
    }

    @PostMapping("/{gserviceId}/unassign-site/{siteId}")
    public ResponseEntity<Map<String, String>> unassignSiteFromGservice(@PathVariable Long gserviceId, @PathVariable Long siteId) {
        gserviceService.unassignSiteFromGservice(gserviceId, siteId);
        return ResponseEntity.ok(Collections.singletonMap("message", "Site unassigned successfully"));
    }

    // Endpoint to get available sites for assignment
    @GetMapping("/{gserviceId}/available-sites")
    public ResponseEntity<List<Site>> getAvailableSites(@PathVariable Long gserviceId) {
        try {
            List<Site> availableSites = gserviceService.findAvailableSites(gserviceId);
            return ResponseEntity.ok(availableSites);
        } catch (GserviceServiceImpl.ResourceNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }
    @GetMapping("/{serviceId}/postes")
    public ResponseEntity<Set<Poste>> getPostByServiceId(@PathVariable Long serviceId) {
        return ResponseEntity.ok(gserviceService.getPosteByServiceId(serviceId));
    }
}