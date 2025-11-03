package com.example.app.Controller;

import com.example.app.DTOs.FormationDTO;
import com.example.app.Service.IFormationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formations")
public class FormationController {

    @Autowired
    private IFormationService formationService;

    @GetMapping("/{id}")
    public ResponseEntity<FormationDTO> getFormationById(@PathVariable Long id) {
        FormationDTO formationDTO = formationService.getFormationById(id);
        return ResponseEntity.ok(formationDTO);
    }

    @GetMapping
    public ResponseEntity<List<FormationDTO>> getAllFormations() {
        List<FormationDTO> formations = formationService.getAllFormations();
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/poste/{posteId}")
    public ResponseEntity<List<FormationDTO>> getFormationsByPoste(@PathVariable Long posteId) {
        List<FormationDTO> formations = formationService.getFormationsByPoste(posteId);
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<FormationDTO>> getUpcomingFormations() {
        List<FormationDTO> formations = formationService.getUpcomingFormations();
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/started")
    public ResponseEntity<List<FormationDTO>> getStartedFormations() {
        List<FormationDTO> formations = formationService.getStartedFormations();
        return ResponseEntity.ok(formations);
    }

    @GetMapping("/finished")
    public ResponseEntity<List<FormationDTO>> getFinishedFormations() {
        List<FormationDTO> formations = formationService.getFinishedFormations();
        return ResponseEntity.ok(formations);
    }

    @PostMapping
    public ResponseEntity<FormationDTO> createFormation(@RequestBody FormationDTO formationDTO) {
        FormationDTO created = formationService.createFormation(formationDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormationDTO> updateFormation(@PathVariable Long id, @RequestBody FormationDTO formationDTO) {
        FormationDTO updated = formationService.updateFormation(id, formationDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormation(@PathVariable Long id) {
        formationService.deleteFormation(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formationId}/cabinets/{cabinetId}")
    public ResponseEntity<Void> assignCabinetToFormation(@PathVariable Long formationId, @PathVariable Long cabinetId) {
        formationService.assignCabinetToFormation(formationId, cabinetId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{formationId}/cabinets/{cabinetId}")
    public ResponseEntity<Void> unassignCabinetFromFormation(@PathVariable Long formationId, @PathVariable Long cabinetId) {
        formationService.unassignCabinetFromFormation(formationId, cabinetId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{formationId}/postes/{posteId}")
    public ResponseEntity<Void> assignPosteToFormation(@PathVariable Long formationId, @PathVariable Long posteId) {
        formationService.assignPosteToFormation(formationId, posteId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{formationId}/postes/{posteId}")
    public ResponseEntity<Void> unassignPosteFromFormation(@PathVariable Long formationId, @PathVariable Long posteId) {
        formationService.unassignPosteFromFormation(formationId, posteId);
        return ResponseEntity.noContent().build();
    }
}