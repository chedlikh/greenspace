package com.example.app.Service;

import com.example.app.DTOs.ProgrammeDTO;
import com.example.app.Entities.*;
import com.example.app.Repository.CabinetRepository;
import com.example.app.Repository.FormationRepository;
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
public class ProgrammeServiceImpl implements IProgrammeService {

    @Autowired
    private ProgrammeRepository programmeRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private CabinetRepository cabinetRepository;

    @Autowired
    private FormationRepository formationRepository;

    @Override
    @Transactional
    public ProgrammeDTO getProgrammeById(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programme not found"));
        return mapToDTO(programme);
    }

    @Override
    @Transactional
    public List<ProgrammeDTO> getAllProgrammes() {
        return programmeRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProgrammeDTO createProgramme(ProgrammeDTO programmeDTO) {
        if (programmeDTO.getNbrdheureparjour() <= 0) {
            throw new IllegalArgumentException("nbrdheureparjour must be positive");
        }
        if (programmeDTO.getDuree() <= 0) {
            throw new IllegalArgumentException("duree must be positive");
        }
        Programme programme = new Programme();
        programme.setTitre(programmeDTO.getTitre());
        programme.setDuree(programmeDTO.getDuree());
        programme.setNbrdheureparjour(programmeDTO.getNbrdheureparjour());
        programme.setHeuredebut(programmeDTO.getHeuredebut());
        programme.setHeurefin(programmeDTO.getHeurefin());
        programme = programmeRepository.save(programme);
        programmeDTO.setId(programme.getId());
        programmeDTO.setCreatedAt(programme.getCreatedAt());
        programmeDTO.setUpdatedAt(programme.getUpdatedAt());
        return programmeDTO;
    }

    @Override
    @Transactional
    public ProgrammeDTO updateProgramme(Long id, ProgrammeDTO programmeDTO) {
        if (programmeDTO.getNbrdheureparjour() <= 0) {
            throw new IllegalArgumentException("nbrdheureparjour must be positive");
        }
        if (programmeDTO.getDuree() <= 0) {
            throw new IllegalArgumentException("duree must be positive");
        }
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programme not found"));
        programme.setTitre(programmeDTO.getTitre());
        programme.setDuree(programmeDTO.getDuree());
        programme.setNbrdheureparjour(programmeDTO.getNbrdheureparjour());
        programme.setHeuredebut(programmeDTO.getHeuredebut());
        programme.setHeurefin(programmeDTO.getHeurefin());
        programme = programmeRepository.save(programme);
        updateRelatedEntities(programme);
        return mapToDTO(programme);
    }

    @Override
    @Transactional
    public void deleteProgramme(Long id) {
        Programme programme = programmeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Programme not found"));
        Session session = programme.getSession();
        if (session != null) {
            session.getProgrammes().remove(programme);
            programme.setSession(null);
            updateSessionDates(session);
            sessionRepository.save(session);
            updateRelatedCabinetAndFormation(session);
        }
        programmeRepository.deleteById(id);
    }

    private void updateRelatedEntities(Programme programme) {
        Session session = programme.getSession();
        if (session != null) {
            updateSessionDates(session);
            sessionRepository.save(session);
            updateRelatedCabinetAndFormation(session);
        }
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

    private ProgrammeDTO mapToDTO(Programme programme) {
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