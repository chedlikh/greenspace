package com.example.app.Service;

import com.example.app.DTOs.FormateurDTO;
import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.DTOs.SessionDTO;
import com.example.app.Entities.Cabinet;
import com.example.app.Entities.Formateur;
import com.example.app.Entities.Programme;
import com.example.app.Entities.Session;
import com.example.app.Entities.Formation;
import com.example.app.Entities.FormationMode;
import com.example.app.Entities.FormationStatus;
import com.example.app.Repository.CabinetRepository;
import com.example.app.Repository.FormationRepository;
import com.example.app.Repository.FormateurRepository;
import com.example.app.Repository.ProgrammeRepository;
import com.example.app.Repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SessionServiceImpl implements ISessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private FormateurRepository formateurRepository;

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private CabinetRepository cabinetRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Override
    @Transactional
    public SessionDTO getSessionById(Long id) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return mapToDTO(session);
    }

    @Override
    @Transactional
    public List<SessionDTO> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SessionDTO createSession(SessionDTO sessionDTO) {
        Session session = new Session();
        session.setObjectifs(sessionDTO.getObjectifs());
        session.setApport(sessionDTO.getApport());
        session.setAffiche(sessionDTO.getAffiche());
        session.setTheme(sessionDTO.getTheme());
        session.setPrix(sessionDTO.getPrix());
        session.setMode(sessionDTO.getMode());
        session.setDatedebut(sessionDTO.getDatedebut());
        session.setDatefin(sessionDTO.getDatefin());
        session = sessionRepository.save(session);
        sessionDTO.setId(session.getId());
        sessionDTO.setCreatedAt(session.getCreatedAt());
        sessionDTO.setUpdatedAt(session.getUpdatedAt());
        return sessionDTO;
    }

    @Override
    @Transactional
    public SessionDTO updateSession(Long id, SessionDTO sessionDTO) {
        Session session = sessionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        session.setObjectifs(sessionDTO.getObjectifs());
        session.setApport(sessionDTO.getApport());
        session.setAffiche(sessionDTO.getAffiche());
        session.setTheme(sessionDTO.getTheme());
        session.setPrix(sessionDTO.getPrix());
        session.setMode(sessionDTO.getMode());
        session.setDatedebut(sessionDTO.getDatedebut());
        session.setDatefin(sessionDTO.getDatefin());
        session = sessionRepository.save(session);
        return mapToDTO(session);
    }

    @Override
    @Transactional
    public void deleteSession(Long id) {
        sessionRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void assignFormateurToSession(Long sessionId, Long formateurId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Formateur formateur = formateurRepository.findById(formateurId)
                .orElseThrow(() -> new RuntimeException("Formateur not found"));
        session.getFormateurs().add(formateur);
        sessionRepository.save(session);
    }

    @Override
    @Transactional
    public void unassignFormateurFromSession(Long sessionId, Long formateurId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Formateur formateur = formateurRepository.findById(formateurId)
                .orElseThrow(() -> new RuntimeException("Formateur not found"));
        session.getFormateurs().remove(formateur);
        sessionRepository.save(session);
    }

    @Override
    @Transactional
    public void assignProgrammeToSession(Long sessionId, Long programmeId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new RuntimeException("Programme not found"));
        if (programme.getSession() != null && !programme.getSession().getId().equals(sessionId)) {
            throw new RuntimeException("Programme is already assigned to another Session");
        }
        programme.setSession(session);
        session.getProgrammes().add(programme);
        updateSessionDates(session);
        sessionRepository.save(session);
        updateRelatedCabinetAndFormation(session);
    }

    @Override
    @Transactional
    public void unassignProgrammeFromSession(Long sessionId, Long programmeId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new RuntimeException("Programme not found"));
        if (programme.getSession() == null || !programme.getSession().getId().equals(sessionId)) {
            throw new RuntimeException("Programme is not assigned to this Session");
        }
        programme.setSession(null);
        session.getProgrammes().remove(programme);
        updateSessionDates(session);
        sessionRepository.save(session);
        updateRelatedCabinetAndFormation(session);
    }

    private void updateSessionDates(Session session) {
        if (session.getProgrammes().isEmpty()) {
            session.setDatedebut(null);
            session.setDatefin(null);
            return;
        }

        // Calculate dates assuming sequential scheduling
        LocalDate startDate = session.getDatedebut() != null ? session.getDatedebut() : LocalDate.now();
        long totalDays = 0;

        for (Programme programme : session.getProgrammes()) {
            int hours = programme.getDuree();
            int hoursPerDay = programme.getNbrdheureparjour();
            long days = (long) Math.ceil((double) hours / hoursPerDay);
            totalDays += days;
        }

        session.setDatedebut(startDate);
        session.setDatefin(startDate.plusDays(totalDays - 1));
    }

    private void updateRelatedCabinetAndFormation(Session session) {
        Cabinet cabinet = session.getCabinet();
        if (cabinet != null) {
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
    }

    private SessionDTO mapToDTO(Session session) {
        SessionDTO dto = new SessionDTO();
        dto.setId(session.getId());
        dto.setDatedebut(session.getDatedebut());
        dto.setDatefin(session.getDatefin());
        dto.setObjectifs(session.getObjectifs());
        dto.setApport(session.getApport());
        dto.setAffiche(session.getAffiche());
        dto.setTheme(session.getTheme());
        dto.setPrix(session.getPrix());
        dto.setMode(session.getMode());
        dto.setCabinetId(session.getCabinet() != null ? session.getCabinet().getId() : null);

        // Convert Set<Formateur> to Set<FormateurDTO>
        Set<FormateurDTO> formateurDTOs = session.getFormateurs().stream()
                .map(f -> {
                    FormateurDTO formateurDTO = new FormateurDTO();
                    formateurDTO.setId(f.getId());
                    formateurDTO.setName(f.getName());
                    formateurDTO.setEmail(f.getEmail());
                    formateurDTO.setPhone(f.getPhone());
                    formateurDTO.setSpecialization(f.getSpecialization());
                    formateurDTO.setBio(f.getBio());
                    formateurDTO.setCreatedAt(f.getCreatedAt());
                    formateurDTO.setUpdatedAt(f.getUpdatedAt());
                    return formateurDTO;
                })
                .collect(Collectors.toSet());
        dto.setFormateurs(formateurDTOs);

        // Convert Set<Programme> to Set<ProgrammeDTO>
        Set<ProgrammeDTO> programmeDTOs = session.getProgrammes().stream()
                .map(p -> {
                    ProgrammeDTO programmeDTO = new ProgrammeDTO();
                    programmeDTO.setId(p.getId());
                    programmeDTO.setTitre(p.getTitre());
                    programmeDTO.setDuree(p.getDuree());
                    programmeDTO.setNbrdheureparjour(p.getNbrdheureparjour());
                    programmeDTO.setHeuredebut(p.getHeuredebut());
                    programmeDTO.setHeurefin(p.getHeurefin());
                    programmeDTO.setSessionId(p.getSession() != null ? p.getSession().getId() : null);
                    programmeDTO.setCreatedAt(p.getCreatedAt());
                    programmeDTO.setUpdatedAt(p.getUpdatedAt());
                    return programmeDTO;
                })
                .collect(Collectors.toSet());
        dto.setProgrammes(programmeDTOs);

        dto.setCreatedAt(session.getCreatedAt());
        dto.setUpdatedAt(session.getUpdatedAt());
        return dto;
    }
    // Add these methods to your existing SessionServiceImpl class

    @Override
    @Transactional
    public List<ProgrammeDTO> getNotAssignedProgrammes() {
        List<Programme> allProgrammes = programmeRepository.findAll();
        return allProgrammes.stream()
                .filter(programme -> programme.getSession() == null)
                .map(this::mapProgrammeToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void assignMultipleProgrammesToSession(Long sessionId, List<Long> programmeIds) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        for (Long programmeId : programmeIds) {
            Programme programme = programmeRepository.findById(programmeId)
                    .orElseThrow(() -> new RuntimeException("Programme not found with id: " + programmeId));

            if (programme.getSession() != null && !programme.getSession().getId().equals(sessionId)) {
                throw new RuntimeException("Programme with id " + programmeId + " is already assigned to another session");
            }

            programme.setSession(session);
            session.getProgrammes().add(programme);
        }

        updateSessionDates(session);
        sessionRepository.save(session);
        updateRelatedCabinetAndFormation(session);
    }

    @Override
    @Transactional
    public List<SessionDTO> getSessionsByFormateur(Long formateurId) {
        Formateur formateur = formateurRepository.findById(formateurId)
                .orElseThrow(() -> new RuntimeException("Formateur not found"));

        return formateur.getSessions().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<SessionDTO> getSessionsByProgramme(Long programmeId) {
        Programme programme = programmeRepository.findById(programmeId)
                .orElseThrow(() -> new RuntimeException("Programme not found"));

        if (programme.getSession() == null) {
            return List.of();
        }

        return List.of(mapToDTO(programme.getSession()));
    }

    @Override
    @Transactional
    public SessionDTO cloneSession(Long sessionId) {
        Session original = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        Session clone = new Session();
        clone.setObjectifs(original.getObjectifs());
        clone.setApport(original.getApport());
        clone.setAffiche(original.getAffiche());
        clone.setTheme(original.getTheme());
        clone.setPrix(original.getPrix());
        clone.setMode(original.getMode());
        clone.setDatedebut(original.getDatedebut());
        clone.setDatefin(original.getDatefin());

        // Don't clone relationships by default - they can be assigned later
        clone = sessionRepository.save(clone);

        return mapToDTO(clone);
    }

    // Helper method to map Programme to ProgrammeDTO
    private ProgrammeDTO mapProgrammeToDTO(Programme programme) {
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
    }
}