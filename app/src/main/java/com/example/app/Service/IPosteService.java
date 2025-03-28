package com.example.app.Service;

import com.example.app.Entities.Gservice;
import com.example.app.Entities.Poste;

import java.util.List;
import java.util.Set;

public interface IPosteService {
    Poste createPoste(Poste poste);
    Poste getPosteById(Long id);
    List<Poste> getAllPostes();
    Poste updatePoste(Long id, Poste poste);
    void deletePoste(Long id);
    Poste assignServiceToPoste(Long posteId, Long serviceId);
    Poste unassignServiceFromPoste(Long posteId, Long serviceId);
    Set<Gservice> getServicesByPosteId(Long posteId);
}
