package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.PosteRepository;
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

    @Autowired
    public PosteServiceImpl(PosteRepository posteRepository, GserviceRepository gserviceRepository) {
        this.posteRepository = posteRepository;
        this.gserviceRepository = gserviceRepository;
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
}