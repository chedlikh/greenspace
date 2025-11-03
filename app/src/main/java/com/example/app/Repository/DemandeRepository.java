package com.example.app.Repository;

import com.example.app.DTOs.DemandeDTO;
import com.example.app.Entities.Demande;
import com.example.app.Entities.DemandeStatus;

import com.example.app.Entities.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {
    Set<Demande> findBySessionIn(Set<Session> sessions);
    Page<Demande> findByUserId(Long userId, Pageable pageable);
    Page<Demande> findBySessionId(Long sessionId, Pageable pageable);
}
