package com.example.app.Repository;

import com.example.app.Entities.Societe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SocieteRepo extends JpaRepository<Societe, Long> {
}
