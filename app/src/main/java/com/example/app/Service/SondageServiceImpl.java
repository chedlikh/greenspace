package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Sondage;
import com.example.app.Repository.GserviceRepository;
import com.example.app.Repository.SondageRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class SondageServiceImpl implements ISondageService {

    private final SondageRepository sondageRepository;
    private final GserviceRepository gserviceRepository;

    @Autowired
    public SondageServiceImpl(SondageRepository sondageRepository, GserviceRepository gserviceRepository) {
        this.sondageRepository = sondageRepository;
        this.gserviceRepository = gserviceRepository;
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

    @Override
    @Transactional
    public Sondage assignServiceToSondage(Long sondageId, Long serviceId) {
        Sondage sondage = getSondageById(sondageId);
        Gservice service = gserviceRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found with id: " + serviceId));

        sondage.assignService(service);
        return sondageRepository.save(sondage);
    }

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
}
