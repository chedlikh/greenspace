package com.example.app.Service;

import com.example.app.Entities.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface IPublicationService {

    Publication savePublication(Publication publication);

    Publication updatePublication(Long id, Publication publicationDetails);

    void deletePublication(Long id);

    Optional<Publication> findById(Long id);

    List<Publication> findAll();

    Page<Publication> findAllPaginated(Pageable pageable);

    List<Publication> findByUserId(Long userId);

    Page<Publication> findByUserIdPaginated(Long userId, Pageable pageable);

    List<Publication> findByPrivacyLevel(Publication.PrivacyLevel privacyLevel);

    void incrementViewCount(Long id);
}
