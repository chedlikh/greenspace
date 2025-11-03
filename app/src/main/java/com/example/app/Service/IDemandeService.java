package com.example.app.Service;

import com.example.app.DTOs.DemandeDTO;
import com.example.app.Entities.DemandeStatus;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IDemandeService {
    DemandeDTO getDemandeById(Long id);
    List<DemandeDTO> getAllDemandes();
    DemandeDTO createDemande(DemandeDTO demandeDTO);
    DemandeDTO updateDemande(Long id, DemandeDTO demandeDTO);
    void deleteDemande(Long id);
    DemandeDTO approveDemande(Long id, Long adminId);
    DemandeDTO rejectDemande(Long id, Long adminId);
    List<DemandeDTO> getDemandesByUserId(Long userId, int page, int size);
    List<DemandeDTO> getDemandesBySessionId(Long sessionId, int page, int size);
}
