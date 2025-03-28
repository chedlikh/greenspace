package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Sondage;

import java.util.List;
import java.util.Set;

public interface ISondageService {

    Sondage createSondage(Sondage sondage);

    Sondage updateSondage(Sondage sondage);

    void deleteSondage(Long id);

    Sondage getSondageById(Long id);

    List<Sondage> getAllSondages();

    Sondage assignServiceToSondage(Long sondageId, Long serviceId);

    Sondage unassignServiceFromSondage(Long sondageId, Long serviceId);

    Set<Gservice> getServicesBySondageId(Long sondageId);
}
