package com.example.app.Controller;

import com.example.app.DTOs.FormationRequestDTO;
import com.example.app.Service.IFormationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formation-requests")
public class FormationRequestController {

    @Autowired
    private IFormationRequestService formationRequestService;

    @GetMapping("/{id}")
    public ResponseEntity<FormationRequestDTO> getFormationRequestById(@PathVariable Long id) {
        FormationRequestDTO formationRequestDTO = formationRequestService.getFormationRequestById(id);
        return ResponseEntity.ok(formationRequestDTO);
    }

    @GetMapping
    public ResponseEntity<List<FormationRequestDTO>> getAllFormationRequests() {
        List<FormationRequestDTO> formationRequests = formationRequestService.getAllFormationRequests();
        return ResponseEntity.ok(formationRequests);
    }

    @PostMapping
    public ResponseEntity<FormationRequestDTO> createFormationRequest(@RequestBody FormationRequestDTO formationRequestDTO) {
        FormationRequestDTO created = formationRequestService.createFormationRequest(formationRequestDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormationRequestDTO> updateFormationRequest(@PathVariable Long id, @RequestBody FormationRequestDTO formationRequestDTO) {
        FormationRequestDTO updated = formationRequestService.updateFormationRequest(id, formationRequestDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormationRequest(@PathVariable Long id) {
        formationRequestService.deleteFormationRequest(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<FormationRequestDTO> approveFormationRequest(@PathVariable Long id, @RequestParam Long adminId) {
        FormationRequestDTO approved = formationRequestService.approveFormationRequest(id, adminId);
        return ResponseEntity.ok(approved);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<FormationRequestDTO> rejectFormationRequest(@PathVariable Long id, @RequestParam Long adminId) {
        FormationRequestDTO rejected = formationRequestService.rejectFormationRequest(id, adminId);
        return ResponseEntity.ok(rejected);
    }
}