package com.example.app.Repository;

import com.example.app.Entities.Site;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SiteRepo extends JpaRepository<Site,Long> {
    Optional<Site> findById(Long id);
}
