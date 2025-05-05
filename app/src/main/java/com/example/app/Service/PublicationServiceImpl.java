package com.example.app.Service;

import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Entities.Publication;
import com.example.app.Repository.GroupRepository;
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

    @Autowired
    private GroupRepository groupRepository;

    @Override
    public Publication savePublication(Publication publication) {
        // Check if the publication is in a group and if the user is restricted from posting
        if (publication.getGroup() != null) {
            if (!canUserPostInGroup(publication.getGroup().getId(), publication.getUser().getId())) {
                throw new RuntimeException("User is restricted from posting in this group");
            }
        }
        publication.setCreateDate(LocalDateTime.now());
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

    @Override
    public List<Publication> findByTargetUserId(Long targetUserId) {
        return publicationRepository.findByTargetUserId(targetUserId);
    }

    @Override
    public Page<Publication> findByTargetUserIdPaginated(Long targetUserId, Pageable pageable) {
        return publicationRepository.findByTargetUserId(targetUserId, pageable);
    }

    @Override
    public Page<Publication> findByUserIdOrTargetUserIdPaginated(Long userId, Long targetUserId, Pageable pageable) {
        return publicationRepository.findByUserIdOrTargetUserId(userId, targetUserId, pageable);
    }

    @Override
    public Page<Publication> findUserTimelinePublications(Long userId, Pageable pageable) {
        return publicationRepository.findUserTimelinePublications(userId, pageable);
    }

    @Override
    public Page<Publication> findByGroupIdPaginated(Long groupId, Pageable pageable) {
        return publicationRepository.findByGroupId(groupId, pageable);
    }

    @Override
    public Page<Publication> findAllPaginatedForUser(Long userId, Pageable pageable) {
        return publicationRepository.findPublicationsForUser(userId, pageable);
    }

    @Override
    public boolean canUserPostInGroup(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));
        return group.getMemberSettings().stream()
                .filter(s -> s.getUser().getId().equals(userId))
                .findFirst()
                .map(GroupMemberSettings::isCanPost)
                .orElse(false);
    }
}