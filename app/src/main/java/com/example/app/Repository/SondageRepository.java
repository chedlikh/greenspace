package com.example.app.Repository;

import com.example.app.Entities.Sondage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SondageRepository extends JpaRepository<Sondage, Long> {

    @Query("SELECT s FROM Sondage s JOIN s.gservices g WHERE g.id = :serviceId")
    List<Sondage> findByServiceId(@Param("serviceId") Long serviceId);
}
