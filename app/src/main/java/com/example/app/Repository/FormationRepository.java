package com.example.app.Repository;

import com.example.app.Entities.Formation;
import com.example.app.Entities.FormationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.time.LocalDate;
import org.springframework.data.domain.Pageable;

@Repository
public interface FormationRepository extends JpaRepository<Formation, Long> {
    Page<Formation> findAll(Pageable pageable);
    Page<Formation> findByStatus(FormationStatus status, Pageable pageable);
    Page<Formation> findByPostesId(Long posteId, Pageable pageable);
    Page<Formation> findByDatedebutBetween(LocalDate start, LocalDate end, Pageable pageable);
}
