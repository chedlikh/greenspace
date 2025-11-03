package com.example.app.Repository;


import com.example.app.Entities.Demande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.example.app.Entities.Session;


import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    List<Session> findByCabinetId(Long cabinetId);
    List<Session> findByCabinetIdIsNull();
    @Query("SELECT s FROM Session s LEFT JOIN FETCH s.formateurs LEFT JOIN FETCH s.programmes WHERE s.cabinet.id = :cabinetId")
    List<Session> findByCabinetIdWithRelations(Long cabinetId);

    @Query("SELECT s FROM Session s LEFT JOIN FETCH s.formateurs LEFT JOIN FETCH s.programmes WHERE s.cabinet IS NULL")
    List<Session> findByCabinetIdIsNullWithRelations();



}
