package com.example.app.Service;

import com.example.app.DTOs.CabinetDTO;
import com.example.app.DTOs.SessionDTO;
import org.springframework.data.domain.Page;

import java.awt.print.Pageable;
import java.util.List;

public interface ICabinetService {
    CabinetDTO getCabinetById(Long id);
    List<CabinetDTO> getAllCabinets();
    CabinetDTO createCabinet(CabinetDTO cabinetDTO);
    CabinetDTO updateCabinet(Long id, CabinetDTO cabinetDTO);
    void deleteCabinet(Long id);
    void assignSessionToCabinet(Long cabinetId, Long sessionId);
    void unassignSessionFromCabinet(Long cabinetId, Long sessionId);
    List<SessionDTO> getAssignedSessionsForCabinet(Long cabinetId);
    List<SessionDTO> getUnassignedSessions();
}
