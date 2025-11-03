package com.example.app.Service;

import com.example.app.DTOs.FormationRequestDTO;
import com.example.app.Entities.DemandeStatus;
import org.springframework.data.domain.Page;


import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IFormationRequestService {
    FormationRequestDTO getFormationRequestById(Long id);
    List<FormationRequestDTO> getAllFormationRequests();
    FormationRequestDTO createFormationRequest(FormationRequestDTO formationRequestDTO);
    FormationRequestDTO updateFormationRequest(Long id, FormationRequestDTO formationRequestDTO);
    void deleteFormationRequest(Long id);
    FormationRequestDTO approveFormationRequest(Long id, Long adminId);
    FormationRequestDTO rejectFormationRequest(Long id, Long adminId);
}
