package com.example.app.Controller;

import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.Service.IProgrammeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/programmes")
public class ProgrammeController {

    @Autowired
    private IProgrammeService programmeService;

    @GetMapping("/{id}")
    public ResponseEntity<ProgrammeDTO> getProgrammeById(@PathVariable Long id) {
        ProgrammeDTO programmeDTO = programmeService.getProgrammeById(id);
        return ResponseEntity.ok(programmeDTO);
    }

    @GetMapping
    public ResponseEntity<List<ProgrammeDTO>> getAllProgrammes() {
        List<ProgrammeDTO> programmes = programmeService.getAllProgrammes();
        return ResponseEntity.ok(programmes);
    }

    @PostMapping
    public ResponseEntity<ProgrammeDTO> createProgramme(@RequestBody ProgrammeDTO programmeDTO) {
        ProgrammeDTO created = programmeService.createProgramme(programmeDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProgrammeDTO> updateProgramme(@PathVariable Long id, @RequestBody ProgrammeDTO programmeDTO) {
        ProgrammeDTO updated = programmeService.updateProgramme(id, programmeDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProgramme(@PathVariable Long id) {
        programmeService.deleteProgramme(id);
        return ResponseEntity.noContent().build();
    }
}