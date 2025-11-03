package com.example.app.Controller;

import com.example.app.DTOs.FormateurDTO;
import com.example.app.Service.IFormateurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/formateurs")
public class FormateurController {

    @Autowired
    private IFormateurService formateurService;

    @GetMapping("/{id}")
    public ResponseEntity<FormateurDTO> getFormateurById(@PathVariable Long id) {
        FormateurDTO formateurDTO = formateurService.getFormateurById(id);
        return ResponseEntity.ok(formateurDTO);
    }

    @GetMapping
    public ResponseEntity<List<FormateurDTO>> getAllFormateurs() {
        List<FormateurDTO> formateurs = formateurService.getAllFormateurs();
        return ResponseEntity.ok(formateurs);
    }

    @PostMapping
    public ResponseEntity<FormateurDTO> createFormateur(@RequestBody FormateurDTO formateurDTO) {
        FormateurDTO created = formateurService.createFormateur(formateurDTO);
        return ResponseEntity.status(201).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FormateurDTO> updateFormateur(@PathVariable Long id, @RequestBody FormateurDTO formateurDTO) {
        FormateurDTO updated = formateurService.updateFormateur(id, formateurDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFormateur(@PathVariable Long id) {
        formateurService.deleteFormateur(id);
        return ResponseEntity.noContent().build();
    }
}