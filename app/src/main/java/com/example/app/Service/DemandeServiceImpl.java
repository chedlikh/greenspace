package com.example.app.Service;

import com.example.app.DTOs.DemandeDTO;
import com.example.app.Entities.Demande;
import com.example.app.Entities.DemandeStatus;
import com.example.app.Entities.User;
import com.example.app.Entities.Session;
import com.example.app.Repository.DemandeRepository;
import com.example.app.Repository.UserRepo;
import com.example.app.Repository.SessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandeServiceImpl implements IDemandeService {

    private static final Logger logger = LoggerFactory.getLogger(DemandeServiceImpl.class);

    @Autowired
    private DemandeRepository demandeRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private SessionRepository sessionRepository;

    @Override
    @Transactional
    public DemandeDTO createDemande(DemandeDTO demandeDTO) {
        Demande demande = new Demande();
        demande.setStatus(demandeDTO.getStatus());
        if (demandeDTO.getUserId() != null) {
            User user = userRepository.findById(demandeDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            demande.setUser(user);
        }
        if (demandeDTO.getSessionId() != null) {
            Session session = sessionRepository.findById(demandeDTO.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            demande.setSession(session);
        } else {
            throw new IllegalArgumentException("Session ID is required");
        }
        demande = demandeRepository.save(demande);
        demandeDTO.setId(demande.getId());
        return demandeDTO;
    }

    @Override
    @Transactional
    public DemandeDTO getDemandeById(Long id) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
        return convertToDTO(demande);
    }

    @Override
    @Transactional
    public List<DemandeDTO> getAllDemandes() {
        return demandeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DemandeDTO updateDemande(Long id, DemandeDTO demandeDTO) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
        demande.setStatus(demandeDTO.getStatus());
        if (demandeDTO.getUserId() != null) {
            User user = userRepository.findById(demandeDTO.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            demande.setUser(user);
        }
        if (demandeDTO.getSessionId() != null) {
            Session session = sessionRepository.findById(demandeDTO.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session not found"));
            demande.setSession(session);
        } else {
            throw new IllegalArgumentException("Session ID is required");
        }
        demande = demandeRepository.save(demande);
        demandeDTO.setId(demande.getId());
        return demandeDTO;
    }

    @Override
    @Transactional
    public void deleteDemande(Long id) {
        demandeRepository.deleteById(id);
    }

    @Override
    @Transactional
    public DemandeDTO approveDemande(Long id, Long adminId) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        demande.setStatus(DemandeStatus.APPROVED);
        demande.setAdmin(admin);
        demande = demandeRepository.save(demande);
        return convertToDTO(demande);
    }

    @Override
    @Transactional
    public DemandeDTO rejectDemande(Long id, Long adminId) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande not found"));
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        demande.setStatus(DemandeStatus.REJECTED);
        demande.setAdmin(admin);
        demande = demandeRepository.save(demande);
        return convertToDTO(demande);
    }

    @Override
    @Transactional
    public List<DemandeDTO> getDemandesByUserId(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return demandeRepository.findByUserId(userId, pageable)
                .map(this::convertToDTO)
                .getContent();
    }

    @Override
    @Transactional
    public List<DemandeDTO> getDemandesBySessionId(Long sessionId, int page, int size) {
        logger.info("Fetching demandes for sessionId: {}, page: {}, size: {}", sessionId, page, size);
        if (sessionId == null) {
            logger.error("Session ID is null");
            throw new IllegalArgumentException("Session ID is required");
        }
        // Verify session exists
        sessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    logger.error("Session not found with id: {}", sessionId);
                    return new RuntimeException("Session not found");
                });
        Pageable pageable = PageRequest.of(page, size);
        List<DemandeDTO> demandes = demandeRepository.findBySessionId(sessionId, pageable)
                .map(this::convertToDTO)
                .getContent();
        logger.info("Retrieved {} demandes for sessionId: {}", demandes.size(), sessionId);
        return demandes;
    }

    private DemandeDTO convertToDTO(Demande demande) {
        if (demande.getSession() == null) {
            logger.warn("Demande with ID {} has no associated Session", demande.getId());
        }
        return new DemandeDTO(
                demande.getId(),
                demande.getUser() != null ? demande.getUser().getId() : null,
                demande.getSession() != null ? demande.getSession().getId() : null,
                demande.getStatus(),
                demande.getAdmin() != null ? demande.getAdmin().getId() : null,
                demande.getCreatedAt(),
                demande.getUpdatedAt()
        );
    }

    private Demande convertToEntity(DemandeDTO dto) {
        Demande demande = new Demande();
        demande.setId(dto.getId());
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            demande.setUser(user);
        }
        // Note: Session is not set here as DTO may have null sessionId
        demande.setStatus(dto.getStatus());
        if (dto.getAdminId() != null) {
            User admin = userRepository.findById(dto.getAdminId())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            demande.setAdmin(admin);
        }
        return demande;
    }
}