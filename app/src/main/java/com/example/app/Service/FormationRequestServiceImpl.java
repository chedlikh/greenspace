package com.example.app.Service;

import com.example.app.DTOs.FormationRequestDTO;
import com.example.app.Entities.DemandeStatus;
import com.example.app.Entities.FormationRequest;
import com.example.app.Entities.User;
import com.example.app.Repository.FormationRequestRepository;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.IFormationRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FormationRequestServiceImpl implements IFormationRequestService {

    @Autowired
    private FormationRequestRepository formationRequestRepository;

    @Autowired
    private UserRepo userRepository;

    @Override
    @Transactional
    public FormationRequestDTO getFormationRequestById(Long id) {
        FormationRequest formationRequest = formationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FormationRequest not found"));

        FormationRequestDTO dto = new FormationRequestDTO();
        dto.setId(formationRequest.getId());
        dto.setUserId(formationRequest.getUser() != null ? formationRequest.getUser().getId() : null);
        dto.setTitre(formationRequest.getTitre());
        dto.setDescription(formationRequest.getDescription());
        dto.setObjectif(formationRequest.getObjectif());
        dto.setApport(formationRequest.getApport());
        dto.setType(formationRequest.getType());
        dto.setStatus(formationRequest.getStatus());
        dto.setAdminId(formationRequest.getAdmin() != null ? formationRequest.getAdmin().getId() : null);
        dto.setCreatedAt(formationRequest.getCreatedAt());
        dto.setUpdatedAt(formationRequest.getUpdatedAt());
        return dto;
    }

    @Override
    @Transactional
    public List<FormationRequestDTO> getAllFormationRequests() {
        return formationRequestRepository.findAll().stream()
                .map(formationRequest -> {
                    FormationRequestDTO dto = new FormationRequestDTO();
                    dto.setId(formationRequest.getId());
                    dto.setUserId(formationRequest.getUser() != null ? formationRequest.getUser().getId() : null);
                    dto.setTitre(formationRequest.getTitre());
                    dto.setStatus(formationRequest.getStatus());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FormationRequestDTO createFormationRequest(FormationRequestDTO formationRequestDTO) {
        FormationRequest formationRequest = new FormationRequest();
        formationRequest.setTitre(formationRequestDTO.getTitre());
        formationRequest.setDescription(formationRequestDTO.getDescription());
        formationRequest.setObjectif(formationRequestDTO.getObjectif());
        formationRequest.setApport(formationRequestDTO.getApport());
        formationRequest.setType(formationRequestDTO.getType());
        formationRequest.setStatus(formationRequestDTO.getStatus());
        if (formationRequestDTO.getUserId() != null) {
            User user = userRepository.findById(formationRequestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            formationRequest.setUser(user);
        }
        formationRequest = formationRequestRepository.save(formationRequest);
        formationRequestDTO.setId(formationRequest.getId());
        return formationRequestDTO;
    }

    @Override
    @Transactional
    public FormationRequestDTO updateFormationRequest(Long id, FormationRequestDTO formationRequestDTO) {
        FormationRequest formationRequest = formationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FormationRequest not found"));
        formationRequest.setTitre(formationRequestDTO.getTitre());
        formationRequest.setDescription(formationRequestDTO.getDescription());
        formationRequest.setObjectif(formationRequestDTO.getObjectif());
        formationRequest.setApport(formationRequestDTO.getApport());
        formationRequest.setType(formationRequestDTO.getType());
        formationRequest.setStatus(formationRequestDTO.getStatus());
        if (formationRequestDTO.getUserId() != null) {
            User user = userRepository.findById(formationRequestDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            formationRequest.setUser(user);
        }
        formationRequest = formationRequestRepository.save(formationRequest);
        formationRequestDTO.setId(formationRequest.getId());
        return formationRequestDTO;
    }

    @Override
    @Transactional
    public void deleteFormationRequest(Long id) {
        formationRequestRepository.deleteById(id);
    }

    @Override
    @Transactional
    public FormationRequestDTO approveFormationRequest(Long id, Long adminId) {
        FormationRequest formationRequest = formationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FormationRequest not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        formationRequest.setStatus(DemandeStatus.APPROVED);
        formationRequest.setAdmin(admin);
        formationRequest = formationRequestRepository.save(formationRequest);

        FormationRequestDTO dto = new FormationRequestDTO();
        dto.setId(formationRequest.getId());
        dto.setUserId(formationRequest.getUser() != null ? formationRequest.getUser().getId() : null);
        dto.setTitre(formationRequest.getTitre());
        dto.setDescription(formationRequest.getDescription());
        dto.setObjectif(formationRequest.getObjectif());
        dto.setApport(formationRequest.getApport());
        dto.setType(formationRequest.getType());
        dto.setStatus(formationRequest.getStatus());
        dto.setAdminId(formationRequest.getAdmin() != null ? formationRequest.getAdmin().getId() : null);
        dto.setCreatedAt(formationRequest.getCreatedAt());
        dto.setUpdatedAt(formationRequest.getUpdatedAt());
        return dto;
    }

    @Override
    @Transactional
    public FormationRequestDTO rejectFormationRequest(Long id, Long adminId) {
        FormationRequest formationRequest = formationRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FormationRequest not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        formationRequest.setStatus(DemandeStatus.REJECTED);
        formationRequest.setAdmin(admin);
        formationRequest = formationRequestRepository.save(formationRequest);

        FormationRequestDTO dto = new FormationRequestDTO();
        dto.setId(formationRequest.getId());
        dto.setUserId(formationRequest.getUser() != null ? formationRequest.getUser().getId() : null);
        dto.setTitre(formationRequest.getTitre());
        dto.setDescription(formationRequest.getDescription());
        dto.setObjectif(formationRequest.getObjectif());
        dto.setApport(formationRequest.getApport());
        dto.setType(formationRequest.getType());
        dto.setStatus(formationRequest.getStatus());
        dto.setAdminId(formationRequest.getAdmin() != null ? formationRequest.getAdmin().getId() : null);
        dto.setCreatedAt(formationRequest.getCreatedAt());
        dto.setUpdatedAt(formationRequest.getUpdatedAt());
        return dto;
    }
}