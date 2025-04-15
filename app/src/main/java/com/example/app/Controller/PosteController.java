package com.example.app.Controller;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Entities.Site;
import com.example.app.Entities.User;
import com.example.app.Service.IPosteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/postes")
public class PosteController {

    private final IPosteService posteService;

    @Autowired
    public PosteController(IPosteService posteService) {
        this.posteService = posteService;
    }

    @PostMapping
    public ResponseEntity<Poste> createPoste(@RequestBody Poste poste) {
        return new ResponseEntity<>(posteService.createPoste(poste), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Poste> getPosteById(@PathVariable Long id) {
        return ResponseEntity.ok(posteService.getPosteById(id));
    }

    @GetMapping
    public ResponseEntity<List<Poste>> getAllPostes() {
        return ResponseEntity.ok(posteService.getAllPostes());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Poste> updatePoste(@PathVariable Long id, @RequestBody Poste poste) {
        return ResponseEntity.ok(posteService.updatePoste(id, poste));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePoste(@PathVariable Long id) {
        posteService.deletePoste(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{posteId}/services/{serviceId}")
    public ResponseEntity<Poste> assignServiceToPoste(@PathVariable Long posteId, @PathVariable Long serviceId) {
        return ResponseEntity.ok(posteService.assignServiceToPoste(posteId, serviceId));
    }

    @DeleteMapping("/{posteId}/services/{serviceId}")
    public ResponseEntity<Poste> unassignServiceFromPoste(@PathVariable Long posteId, @PathVariable Long serviceId) {
        return ResponseEntity.ok(posteService.unassignServiceFromPoste(posteId, serviceId));
    }

    @GetMapping("/{posteId}/services")
    public ResponseEntity<Set<Gservice>> getServicesByPosteId(@PathVariable Long posteId) {
        return ResponseEntity.ok(posteService.getServicesByPosteId(posteId));
    }
    @PostMapping("/{posteId}/assign-users")
    public ResponseEntity<Poste> assignUsersToPoste(
            @PathVariable Long posteId,
            @RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");
        Poste updatedPoste = posteService.assignUsersToPoste(posteId, usernames);
        return new ResponseEntity<>(updatedPoste, HttpStatus.OK);
    }
    @PostMapping("/{posteId}/unassign-users")
    public ResponseEntity<Poste> unassignUsersFromPoste(
            @PathVariable Long posteId,
            @RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");
        Poste updatedPoste = posteService.unassignUsersFromposte(posteId, usernames);
        return new ResponseEntity<>(updatedPoste, HttpStatus.OK);
    }
    @GetMapping("/{posteId}/users")
    public ResponseEntity<List<User>> getUsersByPosteId(@PathVariable Long posteId) {
        List<User> users = posteService.getUsersByPosteId(posteId);
        return ResponseEntity.ok(users);
    }
}
