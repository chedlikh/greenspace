package com.example.app.Controller;

import com.example.app.DTOs.CabinetDTO;
import com.example.app.DTOs.SessionDTO;
import com.example.app.Service.ICabinetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cabinets")
public class CabinetController {

    @Autowired
    private ICabinetService cabinetService;

    @GetMapping("/{id}")
    public ResponseEntity<CabinetDTO> getCabinetById(@PathVariable Long id) {
        CabinetDTO cabinetDTO = cabinetService.getCabinetById(id);
        return ResponseEntity.ok(cabinetDTO);
    }

    @GetMapping
    public ResponseEntity<List<CabinetDTO>> getAllCabinets() {
        List<CabinetDTO> cabinets = cabinetService.getAllCabinets();
        return ResponseEntity.ok(cabinets);
    }

    @PostMapping
    public ResponseEntity<CabinetDTO> createCabinet(@RequestBody CabinetDTO cabinetDTO) {
        CabinetDTO created = cabinetService.createCabinet(cabinetDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CabinetDTO> updateCabinet(@PathVariable Long id, @RequestBody CabinetDTO cabinetDTO) {
        CabinetDTO updated = cabinetService.updateCabinet(id, cabinetDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCabinet(@PathVariable Long id) {
        cabinetService.deleteCabinet(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{cabinetId}/sessions/{sessionId}")
    public ResponseEntity<Void> assignSessionToCabinet(@PathVariable Long cabinetId, @PathVariable Long sessionId) {
        cabinetService.assignSessionToCabinet(cabinetId, sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{cabinetId}/sessions/{sessionId}")
    public ResponseEntity<Void> unassignSessionFromCabinet(@PathVariable Long cabinetId, @PathVariable Long sessionId) {
        cabinetService.unassignSessionFromCabinet(cabinetId, sessionId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{cabinetId}/sessions")
    public ResponseEntity<List<SessionDTO>> getAssignedSessionsForCabinet(@PathVariable Long cabinetId) {
        List<SessionDTO> sessions = cabinetService.getAssignedSessionsForCabinet(cabinetId);
        return ResponseEntity.ok(sessions);
    }
    @GetMapping("/sessions/unassigned")
    public ResponseEntity<List<SessionDTO>> getUnassignedSessions() {
        List<SessionDTO> unassignedSessions = cabinetService.getUnassignedSessions();
        return ResponseEntity.ok(unassignedSessions);
    }
}