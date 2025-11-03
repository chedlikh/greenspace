package com.example.app.Service;

import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.DTOs.SessionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ISessionService {
    SessionDTO getSessionById(Long id);
    List<SessionDTO> getAllSessions();
    SessionDTO createSession(SessionDTO sessionDTO);
    SessionDTO updateSession(Long id, SessionDTO sessionDTO);
    void deleteSession(Long id);
    void assignFormateurToSession(Long sessionId, Long formateurId);
    void unassignFormateurFromSession(Long sessionId, Long formateurId);
    void assignProgrammeToSession(Long sessionId, Long programmeId);
    void unassignProgrammeFromSession(Long sessionId, Long programmeId);
    List<ProgrammeDTO> getNotAssignedProgrammes();
    void assignMultipleProgrammesToSession(Long sessionId, List<Long> programmeIds);
    List<SessionDTO> getSessionsByFormateur(Long formateurId);
    List<SessionDTO> getSessionsByProgramme(Long programmeId);
    SessionDTO cloneSession(Long sessionId);
}
