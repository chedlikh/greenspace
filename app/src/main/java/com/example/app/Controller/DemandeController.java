package com.example.app.Controller;

import com.example.app.DTOs.DemandeDTO;
import com.example.app.Service.IDemandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/demandes")
public class DemandeController {

    @Autowired
    private IDemandeService demandeService;

    @GetMapping("/{id}")
    public ResponseEntity<DemandeDTO> getDemandeById(@PathVariable Long id) {
        DemandeDTO demandeDTO = demandeService.getDemandeById(id);
        return ResponseEntity.ok(demandeDTO);
    }

    @GetMapping
    public ResponseEntity<List<DemandeDTO>> getAllDemandes() {
        List<DemandeDTO> demandes = demandeService.getAllDemandes();
        return ResponseEntity.ok(demandes);
    }

    @PostMapping
    public ResponseEntity<DemandeDTO> createDemande(@RequestBody DemandeDTO demandeDTO) {
        DemandeDTO created = demandeService.createDemande(demandeDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DemandeDTO> updateDemande(@PathVariable Long id, @RequestBody DemandeDTO demandeDTO) {
        DemandeDTO updated = demandeService.updateDemande(id, demandeDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDemande(@PathVariable Long id) {
        demandeService.deleteDemande(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<DemandeDTO> approveDemande(@PathVariable Long id, @RequestParam Long adminId) {
        DemandeDTO approved = demandeService.approveDemande(id, adminId);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<DemandeDTO> rejectDemande(@PathVariable Long id, @RequestParam Long adminId) {
        DemandeDTO rejected = demandeService.rejectDemande(id, adminId);
        return ResponseEntity.ok(rejected);
    }
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DemandeDTO>> getDemandesByUserId(@PathVariable Long userId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        List<DemandeDTO> demandes = demandeService.getDemandesByUserId(userId, page, size);
        return ResponseEntity.ok(demandes);
    }
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<DemandeDTO>> getDemandesBySessionId(@PathVariable Long sessionId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        List<DemandeDTO> demandes = demandeService.getDemandesBySessionId(sessionId, page, size);
        return ResponseEntity.ok(demandes);
    }
}