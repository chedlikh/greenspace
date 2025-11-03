package com.example.app.Repository;

import com.example.app.Entities.DemandeStatus;
import com.example.app.Entities.FormationRequest;

import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Set;

@Repository
public interface FormationRequestRepository extends JpaRepository<FormationRequest, Long> {
    Page<FormationRequest> findAll(Pageable pageable);
    Page<FormationRequest> findByUserId(Long userId, Pageable pageable);
    Page<FormationRequest> findByStatus(DemandeStatus status, Pageable pageable);
    Set<FormationRequest> findByUserIn(Set<User> users);
}
