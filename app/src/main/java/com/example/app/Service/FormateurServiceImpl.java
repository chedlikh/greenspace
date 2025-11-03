package com.example.app.Service;

import com.example.app.DTOs.FormateurDTO;
import com.example.app.Entities.Formateur;
import com.example.app.Repository.FormateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormateurServiceImpl implements IFormateurService {

    @Autowired
    private FormateurRepository formateurRepository;

    @Override
    @Transactional
    public FormateurDTO getFormateurById(Long id) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur not found"));

        FormateurDTO dto = new FormateurDTO();
        dto.setId(formateur.getId());
        dto.setName(formateur.getName());
        dto.setEmail(formateur.getEmail());
        dto.setPhone(formateur.getPhone());
        dto.setSpecialization(formateur.getSpecialization());
        dto.setBio(formateur.getBio());
        dto.setCreatedAt(formateur.getCreatedAt());
        dto.setUpdatedAt(formateur.getUpdatedAt());
        return dto;
    }

    @Override
    @Transactional
    public List<FormateurDTO> getAllFormateurs() {
        return formateurRepository.findAll().stream()
                .map(formateur -> {
                    FormateurDTO dto = new FormateurDTO();
                    dto.setId(formateur.getId());
                    dto.setName(formateur.getName());
                    dto.setEmail(formateur.getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FormateurDTO createFormateur(FormateurDTO formateurDTO) {
        Formateur formateur = new Formateur();
        formateur.setName(formateurDTO.getName());
        formateur.setEmail(formateurDTO.getEmail());
        formateur.setPhone(formateurDTO.getPhone());
        formateur.setSpecialization(formateurDTO.getSpecialization());
        formateur.setBio(formateurDTO.getBio());
        formateur = formateurRepository.save(formateur);
        formateurDTO.setId(formateur.getId());
        return formateurDTO;
    }

    @Override
    @Transactional
    public FormateurDTO updateFormateur(Long id, FormateurDTO formateurDTO) {
        Formateur formateur = formateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formateur not found"));
        formateur.setName(formateurDTO.getName());
        formateur.setEmail(formateurDTO.getEmail());
        formateur.setPhone(formateurDTO.getPhone());
        formateur.setSpecialization(formateurDTO.getSpecialization());
        formateur.setBio(formateurDTO.getBio());
        formateur = formateurRepository.save(formateur);
        formateurDTO.setId(formateur.getId());
        return formateurDTO;
    }

    @Override
    @Transactional
    public void deleteFormateur(Long id) {
        formateurRepository.deleteById(id);
    }
}