package com.example.app.Controller;

import com.example.app.Entities.AuthenticationResponse;
import com.example.app.Entities.Site;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ISiteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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


}
