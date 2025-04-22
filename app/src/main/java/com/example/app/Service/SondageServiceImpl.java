package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.NotificationSondage;
import com.example.app.Entities.Sondage;
import com.example.app.Entities.User;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.SondageRepository;
import com.example.app.Repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class SondageServiceImpl implements ISondageService {
    private static final Logger logger = LoggerFactory.getLogger(SondageServiceImpl.class);


    private final SondageRepository sondageRepository;
    private final GserviceRepository gserviceRepository;
    private final UserRepo userRepo;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    public SondageServiceImpl(SondageRepository sondageRepository, GserviceRepository gserviceRepository,UserRepo userRepo) {
        this.sondageRepository = sondageRepository;
        this.gserviceRepository = gserviceRepository;
        this.userRepo=userRepo;
    }

    @Override
    public Sondage createSondage(Sondage sondage) {
        sondage.updateStatus();
        return sondageRepository.save(sondage);
    }

    @Override
    public Sondage updateSondage(Sondage sondage) {
        Sondage existingSondage = getSondageById(sondage.getId());
        existingSondage.setTitre(sondage.getTitre());
        existingSondage.setDescription(sondage.getDescription());
        existingSondage.setStartDate(sondage.getStartDate());
        existingSondage.setEndDate(sondage.getEndDate());
        existingSondage.updateStatus();
        return sondageRepository.save(existingSondage);
    }

    @Override
    public void deleteSondage(Long id) {
        sondageRepository.deleteById(id);
    }
    @Override
    public Sondage getSondageById(Long id) {
        return sondageRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Sondage not found with id: " + id));
    }

    @Override
    public List<Sondage> getAllSondages() {
        return sondageRepository.findAll();
    }
    /*@Override
    @Transactional
    public Sondage assignServiceToSondage(Long sondageId, Long serviceId) {
        Sondage sondage = getSondageById(sondageId);
        Gservice service = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + serviceId));

        sondage.assignService(service);
        return sondageRepository.save(sondage);
    }*/

    @Override
    @Transactional
    public Sondage unassignServiceFromSondage(Long sondageId, Long serviceId) {
        Sondage sondage = getSondageById(sondageId);
        Gservice service = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + serviceId));

        sondage.unassignService(service);
        return sondageRepository.save(sondage);
    }

    @Override
    public Set<Gservice> getServicesBySondageId(Long sondageId) {
        Sondage sondage = getSondageById(sondageId);
        return sondage.getGservices();
    }
    @Override
    @Transactional
    public Sondage assignServiceToSondage(Long sondageId, Long serviceId) {
        Sondage sondage = sondageRepository.findById(sondageId)
                .orElseThrow(() -> new RuntimeException("Sondage not found"));
        Gservice service = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));

        sondage.getGservices().add(service);
        Sondage updatedSondage = sondageRepository.save(sondage);

        // Notify all users in the service through their postes
        notifyUsersInService(service, sondage);

        return updatedSondage;
    }

    private void notifyUsersInService(Gservice service, Sondage sondage) {
        try {
            // Get all users in the service
            List<User> users = userRepo.findUsersByServiceId(service.getId());
            logger.info("Found {} users in service {}", users.size(), service.getId());

            // Create notification message
            String message = String.format("New sondage '%s' has been assigned to your service '%s'",
                    sondage.getTitre(), service.getName());

            // Create and send notifications to each user
            for (User user : users) {
                try {
                    // Create notification entity
                    NotificationSondage notification = new NotificationSondage();
                    notification.setRecipient(user);
                    notification.setMessage(message);
                    notification.setCreatedAt(LocalDateTime.now());
                    notification.setRead(false);

                    // Save and send notification
                    notificationService.createNotification(notification);

                    // Log successful notification
                    logger.info("Notification sent to user {} about sondage {}",
                            user.getUsername(), sondage.getId());
                } catch (Exception e) {
                    logger.error("Failed to send notification to user {}: {}",
                            user.getUsername(), e.getMessage(), e);
                }
            }
        } catch (Exception e) {
            logger.error("Error in notifyUsersInService for service {}: {}",
                    service.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to send notifications", e);
        }
    }
}
