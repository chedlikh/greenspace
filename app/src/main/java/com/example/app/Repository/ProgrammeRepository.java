package com.example.app.Repository;

import com.example.app.Entities.Programme;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProgrammeRepository extends JpaRepository<Programme, Long> {
    Page<Programme> findAll(Pageable pageable);
    Page<Programme> findBySessionId(Long sessionId, Pageable pageable);
}
