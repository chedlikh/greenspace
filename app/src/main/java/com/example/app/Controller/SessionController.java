package com.example.app.Controller;

import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.DTOs.SessionDTO;
import com.example.app.Service.ISessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private ISessionService sessionService;

    @GetMapping("/{id}")
    public ResponseEntity<SessionDTO> getSessionById(@PathVariable Long id) {
        SessionDTO sessionDTO = sessionService.getSessionById(id);
        return ResponseEntity.ok(sessionDTO);
    }

    @GetMapping
    public ResponseEntity<List<SessionDTO>> getAllSessions() {
        List<SessionDTO> sessions = sessionService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    @PostMapping
    public ResponseEntity<SessionDTO> createSession(@RequestBody SessionDTO sessionDTO) {
        SessionDTO created = sessionService.createSession(sessionDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SessionDTO> updateSession(@PathVariable Long id, @RequestBody SessionDTO sessionDTO) {
        SessionDTO updated = sessionService.updateSession(id, sessionDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/formateurs/{formateurId}")
    public ResponseEntity<Void> assignFormateurToSession(@PathVariable Long sessionId, @PathVariable Long formateurId) {
        sessionService.assignFormateurToSession(sessionId, formateurId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}/formateurs/{formateurId}")
    public ResponseEntity<Void> unassignFormateurFromSession(@PathVariable Long sessionId, @PathVariable Long formateurId) {
        sessionService.unassignFormateurFromSession(sessionId, formateurId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sessionId}/programmes/{programmeId}")
    public ResponseEntity<Void> assignProgrammeToSession(@PathVariable Long sessionId, @PathVariable Long programmeId) {
        sessionService.assignProgrammeToSession(sessionId, programmeId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sessionId}/programmes/{programmeId}")
    public ResponseEntity<Void> unassignProgrammeFromSession(@PathVariable Long sessionId, @PathVariable Long programmeId) {
        sessionService.unassignProgrammeFromSession(sessionId, programmeId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/programmes/not-assigned")
    public ResponseEntity<List<ProgrammeDTO>> getNotAssignedProgrammes() {
        List<ProgrammeDTO> programmes = sessionService.getNotAssignedProgrammes();
        return ResponseEntity.ok(programmes);
    }
    @PostMapping("/{sessionId}/programmes/batch-assign")
    public ResponseEntity<Void> assignMultipleProgrammesToSession(
            @PathVariable Long sessionId,
            @RequestBody List<Long> programmeIds) {
        sessionService.assignMultipleProgrammesToSession(sessionId, programmeIds);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/formateurs/{formateurId}")
    public ResponseEntity<List<SessionDTO>> getSessionsByFormateur(@PathVariable Long formateurId) {
        List<SessionDTO> sessions = sessionService.getSessionsByFormateur(formateurId);
        return ResponseEntity.ok(sessions);
    }
    @GetMapping("/programmes/{programmeId}")
    public ResponseEntity<List<SessionDTO>> getSessionsByProgramme(@PathVariable Long programmeId) {
        List<SessionDTO> sessions = sessionService.getSessionsByProgramme(programmeId);
        return ResponseEntity.ok(sessions);
    }
    @PostMapping("/{sessionId}/clone")
    public ResponseEntity<SessionDTO> cloneSession(@PathVariable Long sessionId) {
        SessionDTO clonedSession = sessionService.cloneSession(sessionId);
        return ResponseEntity.status(201).body(clonedSession);
    }
}