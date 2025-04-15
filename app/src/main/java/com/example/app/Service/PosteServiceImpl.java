package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Entities.Site;
import com.example.app.Entities.User;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.PosteRepository;
import com.example.app.Repository.UserRepo;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class PosteServiceImpl implements IPosteService{

    private final PosteRepository posteRepository;
    private final GserviceRepository gserviceRepository;
    private final UserRepo userRepo;

    @Autowired
    public PosteServiceImpl(PosteRepository posteRepository, GserviceRepository gserviceRepository, UserRepo userRepo) {
        this.posteRepository = posteRepository;
        this.gserviceRepository = gserviceRepository;
        this.userRepo = userRepo;
    }

    @Override
    public Poste createPoste(Poste poste) {
        return posteRepository.save(poste);
    }

    @Override
    public Poste getPosteById(Long id) {
        return posteRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Poste not found with id: " + id));
    }

    @Override
    public List<Poste> getAllPostes() {
        return posteRepository.findAll();
    }

    @Override
    public Poste updatePoste(Long id, Poste posteDetails) {
        Poste poste = getPosteById(id);
        poste.setTitre(posteDetails.getTitre());
        return posteRepository.save(poste);
    }

    @Override
    public void deletePoste(Long id) {
        Poste poste = getPosteById(id);
        posteRepository.delete(poste);
    }

    @Override
    @Transactional
    public Poste assignServiceToPoste(Long posteId, Long serviceId) {
        Poste poste = getPosteById(posteId);
        Gservice gservice = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + serviceId));

        poste.assignService(gservice);
        return posteRepository.save(poste);
    }

    @Override
    @Transactional
    public Poste unassignServiceFromPoste(Long posteId, Long serviceId) {
        Poste poste = getPosteById(posteId);
        Gservice gservice = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + serviceId));

        poste.unassignService(gservice);
        return posteRepository.save(poste);
    }

    @Override
    public Set<Gservice> getServicesByPosteId(Long posteId) {
        Poste poste = getPosteById(posteId);
        return poste.getGservices();
    }
    @Override
    public Poste assignUsersToPoste(Long posteId, List<String> usernames) {
        // Fetch the site by siteId
        Poste poste = posteRepository.findById(posteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Fetch users by usernames and add them to the site
        for (String username : usernames) {
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));
            poste.getUsers().add(user); // Add user to the site's user set
            user.setPoste(poste); // Set the site for the user (bidirectional relationship)
        }


        return posteRepository.save(poste);
    }
    @Override
    public Poste unassignUsersFromposte(Long posteId, List<String> usernames) {

        Poste poste = posteRepository.findById(posteId)
                .orElseThrow(() -> new RuntimeException("Site not found"));

        // Fetch users by usernames and remove them from the site
        for (String username : usernames) {
            User user = userRepo.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username));

            // Remove the user from the site's user set
            poste.getUsers().remove(user);

            // Set the user's site to null (optional, depending on your bidirectional relationship)
            user.setPoste(null);
        }

        // Save the updated site
        return posteRepository.save(poste);
    }
    @Override
    public List<User> getUsersByPosteId(Long posteId) {
        return userRepo.findByPosteId(posteId);
    }
}