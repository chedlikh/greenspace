package com.example.app.Repository;

import com.example.app.Entities.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByUserId(Long userId);
    Page<Publication> findByUserId(Long userId, Pageable pageable);
    List<Publication> findByPrivacyLevel(Publication.PrivacyLevel privacyLevel);
}