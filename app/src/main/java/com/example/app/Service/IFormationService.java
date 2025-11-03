package com.example.app.Service;

import com.example.app.DTOs.FormationDTO;
import com.example.app.Entities.FormationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDate;
import java.util.List;

public interface IFormationService {
    FormationDTO getFormationById(Long id);
    List<FormationDTO> getAllFormations();
    FormationDTO createFormation(FormationDTO formationDTO);
    FormationDTO updateFormation(Long id, FormationDTO formationDTO);
    void deleteFormation(Long id);
    void assignCabinetToFormation(Long formationId, Long cabinetId);
    void unassignCabinetFromFormation(Long formationId, Long cabinetId);
    List<FormationDTO> getFormationsByPoste(Long posteId);
    List<FormationDTO> getUpcomingFormations();
    List<FormationDTO> getStartedFormations();
    List<FormationDTO> getFinishedFormations();
    void assignPosteToFormation(Long formationId, Long posteId);
    void unassignPosteFromFormation(Long formationId, Long posteId);
}
