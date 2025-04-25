package com.example.app.Service;

import com.example.app.Entities.Publication;
import com.example.app.Repository.PublicationRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PublicationServiceImpl implements IPublicationService {

    @Autowired
    private PublicationRepository publicationRepository;

    @Override
    public Publication savePublication(Publication publication) {
        return publicationRepository.save(publication);
    }

    @Override
    public Publication updatePublication(Long id, Publication publicationDetails) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + id));

        publication.setContent(publicationDetails.getContent());
        publication.setPrivacyLevel(publicationDetails.getPrivacyLevel());
        publication.setLocation(publicationDetails.getLocation());
        publication.setFeeling(publicationDetails.getFeeling());
        publication.setIsEdited(true);
        publication.setUpdateDate(LocalDateTime.now());

        return publicationRepository.save(publication);
    }

    @Override
    public void deletePublication(Long id) {
        publicationRepository.deleteById(id);
    }

    @Override
    public Optional<Publication> findById(Long id) {
        return publicationRepository.findById(id);
    }

    @Override
    public List<Publication> findAll() {
        return publicationRepository.findAll();
    }

    @Override
    public Page<Publication> findAllPaginated(Pageable pageable) {
        return publicationRepository.findAll(pageable);
    }

    @Override
    public List<Publication> findByUserId(Long userId) {
        return publicationRepository.findByUserId(userId);
    }

    @Override
    public Page<Publication> findByUserIdPaginated(Long userId, Pageable pageable) {
        return publicationRepository.findByUserId(userId, pageable);
    }

    @Override
    public List<Publication> findByPrivacyLevel(Publication.PrivacyLevel privacyLevel) {
        return publicationRepository.findByPrivacyLevel(privacyLevel);
    }

    @Override
    public void incrementViewCount(Long id) {
        Publication publication = publicationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + id));
        publication.setViewCount(publication.getViewCount() + 1);
        publicationRepository.save(publication);
    }
}