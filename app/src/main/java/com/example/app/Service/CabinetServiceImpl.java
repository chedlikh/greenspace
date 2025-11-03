package com.example.app.Service;

import com.example.app.DTOs.CabinetDTO;
import com.example.app.DTOs.FormateurDTO;
import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.DTOs.SessionDTO;
import com.example.app.Entities.Cabinet;
import com.example.app.Entities.Formation;
import com.example.app.Entities.Programme;
import com.example.app.Entities.Session;
import com.example.app.Entities.FormationMode;
import com.example.app.Entities.FormationStatus;
import com.example.app.Repository.CabinetRepository;
import com.example.app.Repository.FormationRepository;
import com.example.app.Repository.SessionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CabinetServiceImpl implements ICabinetService {

    @Autowired
    private CabinetRepository cabinetRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Override
    @Transactional
    public CabinetDTO getCabinetById(Long id) {
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));

        CabinetDTO dto = new CabinetDTO();
        dto.setId(cabinet.getId());
        dto.setNom(cabinet.getNom());
        dto.setAdresse(cabinet.getAdresse());
        dto.setLogo(cabinet.getLogo());
        dto.setTel(cabinet.getTel());
        dto.setCatalogue(cabinet.getCatalogue());
        dto.setMotscles(cabinet.getMotscles());
        dto.setDescription(cabinet.getDescription());
        dto.setDuree(cabinet.getDuree());
        dto.setFormationId(cabinet.getFormation() != null ? cabinet.getFormation().getId() : null);
        dto.setCreatedAt(cabinet.getCreatedAt());
        dto.setUpdatedAt(cabinet.getUpdatedAt());
        return dto;
    }

    @Override
    @Transactional
    public List<CabinetDTO> getAllCabinets() {
        return cabinetRepository.findAll().stream()
                .map(cabinet -> {
                    CabinetDTO dto = new CabinetDTO();
                    dto.setId(cabinet.getId());
                    dto.setNom(cabinet.getNom());
                    dto.setAdresse(cabinet.getAdresse());
                    dto.setLogo(cabinet.getLogo());
                    dto.setTel(cabinet.getTel());
                    dto.setCatalogue(cabinet.getCatalogue());
                    dto.setMotscles(cabinet.getMotscles());
                    dto.setDescription(cabinet.getDescription());
                    dto.setDuree(cabinet.getDuree());
                    dto.setFormationId(cabinet.getFormation() != null ? cabinet.getFormation().getId() : null);
                    dto.setCreatedAt(cabinet.getCreatedAt());
                    dto.setUpdatedAt(cabinet.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CabinetDTO createCabinet(CabinetDTO cabinetDTO) {
        Cabinet cabinet = new Cabinet();
        cabinet.setNom(cabinetDTO.getNom());
        cabinet.setAdresse(cabinetDTO.getAdresse());
        cabinet.setLogo(cabinetDTO.getLogo());
        cabinet.setTel(cabinetDTO.getTel());
        cabinet.setCatalogue(cabinetDTO.getCatalogue());
        cabinet.setMotscles(cabinetDTO.getMotscles());
        cabinet.setDescription(cabinetDTO.getDescription());
        cabinet.setDuree(0);
        cabinet = cabinetRepository.save(cabinet);
        cabinetDTO.setId(cabinet.getId());
        cabinetDTO.setDuree(cabinet.getDuree());
        return cabinetDTO;
    }

    @Override
    @Transactional
    public CabinetDTO updateCabinet(Long id, CabinetDTO cabinetDTO) {
        Cabinet cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        cabinet.setNom(cabinetDTO.getNom());
        cabinet.setAdresse(cabinetDTO.getAdresse());
        cabinet.setLogo(cabinetDTO.getLogo());
        cabinet.setTel(cabinetDTO.getTel());
        cabinet.setCatalogue(cabinetDTO.getCatalogue());
        cabinet.setMotscles(cabinetDTO.getMotscles());
        cabinet.setDescription(cabinetDTO.getDescription());
        cabinet = cabinetRepository.save(cabinet);
        cabinetDTO.setId(cabinet.getId());
        cabinetDTO.setDuree(cabinet.getDuree());
        return cabinetDTO;
    }

    @Override
    @Transactional
    public void deleteCabinet(Long id) {
        cabinetRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void assignSessionToCabinet(Long cabinetId, Long sessionId) {
        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        if (session.getCabinet() != null && !session.getCabinet().getId().equals(cabinetId)) {
            throw new RuntimeException("Session is already assigned to another Cabinet");
        }
        session.setCabinet(cabinet);
        cabinet.getSessions().add(session);
        updateCabinetAndFormation(cabinet);
        cabinetRepository.save(cabinet);
    }

    @Override
    @Transactional
    public void unassignSessionFromCabinet(Long cabinetId, Long sessionId) {
        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (session.getCabinet() == null || !session.getCabinet().getId().equals(cabinetId)) {
            throw new RuntimeException("Session is not assigned to this Cabinet");
        }

        // Just setting the reference to null should be enough with proper JPA cascading
        session.setCabinet(null);

        // JPA should automatically update both sides of the relationship
        sessionRepository.save(session);

        updateCabinetAndFormation(cabinet);
    }

    private void updateCabinetAndFormation(Cabinet cabinet) {
        int totalDays = cabinet.getSessions().stream()
                .filter(s -> s.getDatedebut() != null && s.getDatefin() != null)
                .mapToInt(s -> (int) ChronoUnit.DAYS.between(s.getDatedebut(), s.getDatefin()) + 1)
                .sum();
        cabinet.setDuree(totalDays);
        cabinetRepository.save(cabinet);

        Formation formation = cabinet.getFormation();
        if (formation != null) {
            Set<Session> sessions = formation.getCabinets().stream()
                    .flatMap(c -> c.getSessions().stream())
                    .collect(Collectors.toSet());

            LocalDate earliestDate = sessions.stream()
                    .filter(s -> s.getDatedebut() != null)
                    .map(Session::getDatedebut)
                    .min(LocalDate::compareTo)
                    .orElse(null);
            LocalDate latestDate = sessions.stream()
                    .filter(s -> s.getDatefin() != null)
                    .map(Session::getDatefin)
                    .max(LocalDate::compareTo)
                    .orElse(null);
            formation.setDatedebut(earliestDate);
            formation.setDatefin(latestDate);

            int totalHours = sessions.stream()
                    .flatMap(s -> s.getProgrammes().stream())
                    .mapToInt(Programme::getDuree)
                    .sum();
            formation.setDuree(totalHours);

            formation.setPrix(sessions.stream()
                    .mapToDouble(Session::getPrix)
                    .sum());
            formation.setAffiche(sessions.stream()
                    .map(Session::getAffiche)
                    .filter(a -> a != null)
                    .collect(Collectors.joining(",")));
            formation.setObjectif(sessions.stream()
                    .map(Session::getObjectifs)
                    .filter(o -> o != null)
                    .collect(Collectors.joining(";")));
            formation.setApport(sessions.stream()
                    .map(Session::getApport)
                    .filter(a -> a != null)
                    .collect(Collectors.joining(";")));
            formation.setMode(sessions.stream()
                    .map(Session::getMode)
                    .filter(m -> m != null)
                    .findFirst()
                    .orElse(FormationMode.ONLINE));
            formation.setType(totalHours > 100 ? "Long" : "Short");
            LocalDate today = LocalDate.now();
            if (earliestDate != null && latestDate != null) {
                if (today.isBefore(earliestDate)) {
                    formation.setStatus(FormationStatus.COMING_SOON);
                } else if (today.isAfter(latestDate)) {
                    formation.setStatus(FormationStatus.FINISHED);
                } else {
                    formation.setStatus(FormationStatus.STARTED);
                }
            } else {
                formation.setStatus(FormationStatus.COMING_SOON);
            }

            formationRepository.save(formation);
        }
    }
    @Override
    public List<SessionDTO> getAssignedSessionsForCabinet(Long cabinetId) {
        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new EntityNotFoundException("Cabinet with ID " + cabinetId + " not found"));
        Set<Session> sessions = cabinet.getSessions();
        List<SessionDTO> sessionDTOs = new ArrayList<>();

        for (Session session : sessions) {
            SessionDTO sessionDTO = new SessionDTO();
            sessionDTO.setId(session.getId());
            sessionDTO.setDatedebut(session.getDatedebut());
            sessionDTO.setDatefin(session.getDatefin());
            sessionDTO.setObjectifs(session.getObjectifs());
            sessionDTO.setApport(session.getApport());
            sessionDTO.setAffiche(session.getAffiche());
            sessionDTO.setTheme(session.getTheme());
            sessionDTO.setPrix(session.getPrix());
            sessionDTO.setMode(session.getMode());
            sessionDTOs.add(sessionDTO);
        }

        return sessionDTOs;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SessionDTO> getUnassignedSessions() {
        List<Session> sessions = sessionRepository.findByCabinetIdIsNull();
        return sessions.stream()
                .map(this::convertToSessionDTO)
                .collect(Collectors.toList());
    }

    private CabinetDTO convertToCabinetDTO(Cabinet cabinet) {
        CabinetDTO cabinetDTO = new CabinetDTO();
        cabinetDTO.setId(cabinet.getId());
        cabinetDTO.setNom(cabinet.getNom());
        cabinetDTO.setAdresse(cabinet.getAdresse());
        cabinetDTO.setLogo(cabinet.getLogo());
        cabinetDTO.setTel(cabinet.getTel());
        cabinetDTO.setCatalogue(cabinet.getCatalogue());
        cabinetDTO.setMotscles(cabinet.getMotscles());
        cabinetDTO.setDescription(cabinet.getDescription());
        cabinetDTO.setDuree(cabinet.getDuree());
        cabinetDTO.setCreatedAt(cabinet.getCreatedAt());
        cabinetDTO.setUpdatedAt(cabinet.getUpdatedAt());
        return cabinetDTO;
    }
    private SessionDTO convertToSessionDTO(Session session) {
        SessionDTO sessionDTO = new SessionDTO();
        sessionDTO.setId(session.getId());
        sessionDTO.setDatedebut(session.getDatedebut());
        sessionDTO.setDatefin(session.getDatefin());
        sessionDTO.setObjectifs(session.getObjectifs());
        sessionDTO.setApport(session.getApport());
        sessionDTO.setAffiche(session.getAffiche());
        sessionDTO.setTheme(session.getTheme());
        sessionDTO.setPrix(session.getPrix());
        sessionDTO.setMode(session.getMode());
        sessionDTO.setCabinetId(session.getCabinet() != null ? session.getCabinet().getId() : null);

        // Convert Set<Formateur> to Set<FormateurDTO>
        Set<FormateurDTO> formateurDTOs = session.getFormateurs().stream()
                .map(formateur -> {
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
                })
                .collect(Collectors.toSet());
        sessionDTO.setFormateurs(formateurDTOs);

        // Convert Set<Programme> to Set<ProgrammeDTO>
        Set<ProgrammeDTO> programmeDTOs = session.getProgrammes().stream()
                .map(programme -> {
                    ProgrammeDTO dto = new ProgrammeDTO();
                    dto.setId(programme.getId());
                    dto.setTitre(programme.getTitre());
                    dto.setDuree(programme.getDuree());
                    dto.setNbrdheureparjour(programme.getNbrdheureparjour());
                    dto.setHeuredebut(programme.getHeuredebut());
                    dto.setHeurefin(programme.getHeurefin());
                    dto.setSessionId(programme.getSession() != null ? programme.getSession().getId() : null);
                    dto.setCreatedAt(programme.getCreatedAt());
                    dto.setUpdatedAt(programme.getUpdatedAt());
                    return dto;
                })
                .collect(Collectors.toSet());
        sessionDTO.setProgrammes(programmeDTOs);

        sessionDTO.setCreatedAt(session.getCreatedAt());
        sessionDTO.setUpdatedAt(session.getUpdatedAt());
        return sessionDTO;
    }
}