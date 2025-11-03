package com.example.app.Service;

import com.example.app.DTOs.ProgrammeDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IProgrammeService {
    ProgrammeDTO getProgrammeById(Long id);
    List<ProgrammeDTO> getAllProgrammes();
    ProgrammeDTO createProgramme(ProgrammeDTO programmeDTO);
    ProgrammeDTO updateProgramme(Long id, ProgrammeDTO programmeDTO);
    void deleteProgramme(Long id);
}
