package com.example.app.Service;

import com.example.app.DTOs.FormateurDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IFormateurService {
    FormateurDTO getFormateurById(Long id);
    List<FormateurDTO> getAllFormateurs();
    FormateurDTO createFormateur(FormateurDTO formateurDTO);
    FormateurDTO updateFormateur(Long id, FormateurDTO formateurDTO);
    void deleteFormateur(Long id);
}
