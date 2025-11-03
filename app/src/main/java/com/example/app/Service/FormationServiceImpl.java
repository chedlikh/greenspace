package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import com.example.app.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class FormationServiceImpl implements IFormationService {

    @Autowired
    private FormationRepository formationRepository;

    @Autowired
    private CabinetRepository cabinetRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private FormationRequestRepository formationRequestRepository;

    @Autowired
    private PosteRepository posteRepository;

    @Override
    @Transactional
    public FormationDTO getFormationById(Long id) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        return mapToDTO(formation);
    }

    @Override
    @Transactional
    public List<FormationDTO> getAllFormations() {
        return formationRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<FormationDTO> getFormationsByPoste(Long posteId) {
        return formationRepository.findByPostesId(posteId, null).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<FormationDTO> getUpcomingFormations() {
        return formationRepository.findByStatus(FormationStatus.COMING_SOON, null).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<FormationDTO> getStartedFormations() {
        return formationRepository.findByStatus(FormationStatus.STARTED, null).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<FormationDTO> getFinishedFormations() {
        return formationRepository.findByStatus(FormationStatus.FINISHED, null).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FormationDTO createFormation(FormationDTO formationDTO) {
        Formation formation = new Formation();
        formation.setTitre(formationDTO.getTitre());
        formation.setDescription(formationDTO.getDescription());
        formation = formationRepository.save(formation);
        formationDTO.setId(formation.getId());
        return formationDTO;
    }

    @Override
    @Transactional
    public FormationDTO updateFormation(Long id, FormationDTO formationDTO) {
        Formation formation = formationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        formation.setTitre(formationDTO.getTitre());
        formation.setDescription(formationDTO.getDescription());
        formation = formationRepository.save(formation);
        return mapToDTO(formation);
    }

    @Override
    @Transactional
    public void deleteFormation(Long id) {
        formationRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void assignCabinetToFormation(Long formationId, Long cabinetId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        if (cabinet.getFormation() != null && !cabinet.getFormation().getId().equals(formationId)) {
            throw new RuntimeException("Cabinet is already assigned to another Formation");
        }
        cabinet.setFormation(formation);
        formation.getCabinets().add(cabinet);
        updateFormationFields(formation);
        formationRepository.save(formation);
    }

    @Override
    @Transactional
    public void unassignCabinetFromFormation(Long formationId, Long cabinetId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        Cabinet cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet not found"));
        if (cabinet.getFormation() == null || !cabinet.getFormation().getId().equals(formationId)) {
            throw new RuntimeException("Cabinet is not assigned to this Formation");
        }
        cabinet.setFormation(null);
        formation.getCabinets().remove(cabinet);
        updateFormationFields(formation);
        formationRepository.save(formation);
    }

    @Override
    @Transactional
    public void assignPosteToFormation(Long formationId, Long posteId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        Poste poste = posteRepository.findById(posteId)
                .orElseThrow(() -> new RuntimeException("Poste not found"));
        formation.getPostes().add(poste);
        poste.getFormations().add(formation);
        formationRepository.save(formation);
    }

    @Override
    @Transactional
    public void unassignPosteFromFormation(Long formationId, Long posteId) {
        Formation formation = formationRepository.findById(formationId)
                .orElseThrow(() -> new RuntimeException("Formation not found"));
        Poste poste = posteRepository.findById(posteId)
                .orElseThrow(() -> new RuntimeException("Poste not found"));
        formation.getPostes().remove(poste);
        poste.getFormations().remove(formation);
        formationRepository.save(formation);
    }

    private void updateFormationFields(Formation formation) {
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

        double totalPrix = sessions.stream()
                .mapToDouble(s -> s.getPrix() != null ? s.getPrix() : 0.0)
                .sum();
        formation.setPrix(totalPrix == 0.0 ? 0.0 : totalPrix); // Explicitly set to 0 if no sessions

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
    }

    private FormationDTO mapToDTO(Formation formation) {
        FormationDTO dto = new FormationDTO();
        dto.setId(formation.getId());
        dto.setTitre(formation.getTitre());
        dto.setDescription(formation.getDescription());
        dto.setDatedebut(formation.getDatedebut());
        dto.setDatefin(formation.getDatefin());
        dto.setDuree(formation.getDuree());
        dto.setPrix(formation.getPrix());
        dto.setAffiche(formation.getAffiche());
        dto.setObjectif(formation.getObjectif());
        dto.setApport(formation.getApport());
        dto.setMode(formation.getMode());
        dto.setType(formation.getType());
        dto.setStatus(formation.getStatus());

        Set<Session> sessions = formation.getCabinets().stream()
                .flatMap(cabinet -> cabinet.getSessions().stream())
                .collect(Collectors.toSet());

        // Map Postes
        Set<PosteDTO> posteDTOs = formation.getPostes().stream()
                .map(p -> {
                    PosteDTO posteDTO = new PosteDTO();
                    posteDTO.setId(p.getId());
                    posteDTO.setTitre(p.getTitre());
                    return posteDTO;
                })
                .collect(Collectors.toSet());
        dto.setPostes(posteDTOs);

        // Map Cabinets
        Set<CabinetDTO> cabinetDTOs = formation.getCabinets().stream()
                .map(c -> {
                    CabinetDTO cabinetDTO = new CabinetDTO();
                    cabinetDTO.setId(c.getId());
                    cabinetDTO.setNom(c.getNom());
                    cabinetDTO.setAdresse(c.getAdresse());
                    cabinetDTO.setLogo(c.getLogo());
                    cabinetDTO.setTel(c.getTel());
                    cabinetDTO.setCatalogue(c.getCatalogue());
                    cabinetDTO.setMotscles(c.getMotscles());
                    cabinetDTO.setDescription(c.getDescription());
                    cabinetDTO.setDuree(c.getDuree());
                    cabinetDTO.setFormationId(c.getFormation() != null ? c.getFormation().getId() : null);
                    cabinetDTO.setCreatedAt(c.getCreatedAt());
                    cabinetDTO.setUpdatedAt(c.getUpdatedAt());
                    return cabinetDTO;
                })
                .collect(Collectors.toSet());
        dto.setCabinets(cabinetDTOs);

        // Map Sessions
        Set<SessionDTO> sessionDTOs = sessions.stream()
                .map(s -> {
                    SessionDTO sessionDTO = new SessionDTO();
                    sessionDTO.setId(s.getId());
                    sessionDTO.setDatedebut(s.getDatedebut());
                    sessionDTO.setDatefin(s.getDatefin());
                    sessionDTO.setObjectifs(s.getObjectifs());
                    sessionDTO.setApport(s.getApport());
                    sessionDTO.setAffiche(s.getAffiche());
                    sessionDTO.setTheme(s.getTheme());
                    sessionDTO.setPrix(s.getPrix());
                    sessionDTO.setMode(s.getMode());
                    sessionDTO.setCabinetId(s.getCabinet() != null ? s.getCabinet().getId() : null);

                    // Map Formateurs
                    Set<FormateurDTO> formateurDTOs = s.getFormateurs().stream()
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
                    sessionDTO.setFormateurs(formateurDTOs);

                    // Map Programmes
                    Set<ProgrammeDTO> programmeDTOs = s.getProgrammes().stream()
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
                    sessionDTO.setProgrammes(programmeDTOs);

                    sessionDTO.setCreatedAt(s.getCreatedAt());
                    sessionDTO.setUpdatedAt(s.getUpdatedAt());
                    return sessionDTO;
                })
                .collect(Collectors.toSet());
        dto.setSessions(sessionDTOs);

        // Map Demandes
        Set<DemandeDTO> demandeDTOs = demandeRepository.findBySessionIn(sessions).stream()
                .map(d -> {
                    DemandeDTO demandeDTO = new DemandeDTO();
                    demandeDTO.setId(d.getId());
                    demandeDTO.setUserId(d.getUser() != null ? d.getUser().getId() : null);
                    demandeDTO.setSessionId(d.getSession() != null ? d.getSession().getId() : null);
                    demandeDTO.setStatus(d.getStatus());
                    demandeDTO.setAdminId(d.getAdmin() != null ? d.getAdmin().getId() : null);
                    demandeDTO.setCreatedAt(d.getCreatedAt());
                    demandeDTO.setUpdatedAt(d.getUpdatedAt());
                    return demandeDTO;
                })
                .collect(Collectors.toSet());
        dto.setDemandes(demandeDTOs);

        // Map FormationRequests
        Set<FormationRequestDTO> requestDTOs = formationRequestRepository.findByUserIn(
                        sessions.stream()
                                .flatMap(s -> s.getFormateurs().stream())
                                .map(f -> {
                                    User user = new User();
                                    user.setId(f.getId());
                                    return user;
                                })
                                .collect(Collectors.toSet())
                ).stream()
                .map(fr -> {
                    FormationRequestDTO requestDTO = new FormationRequestDTO();
                    requestDTO.setId(fr.getId());
                    requestDTO.setUserId(fr.getUser() != null ? fr.getUser().getId() : null);
                    requestDTO.setTitre(fr.getTitre());
                    requestDTO.setDescription(fr.getDescription());
                    requestDTO.setObjectif(fr.getObjectif());
                    requestDTO.setApport(fr.getApport());
                    requestDTO.setType(fr.getType());
                    requestDTO.setStatus(fr.getStatus());
                    requestDTO.setAdminId(fr.getAdmin() != null ? fr.getAdmin().getId() : null);
                    requestDTO.setCreatedAt(fr.getCreatedAt());
                    requestDTO.setUpdatedAt(fr.getUpdatedAt());
                    return requestDTO;
                })
                .collect(Collectors.toSet());
        dto.setFormationRequests(requestDTOs);

        return dto;
    }
}