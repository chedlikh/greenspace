package com.example.app.Repository;

import com.example.app.Entities.Publication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PublicationRepository extends JpaRepository<Publication, Long> {
    List<Publication> findByUserId(Long userId);
    Page<Publication> findByUserId(Long userId, Pageable pageable);
    List<Publication> findByPrivacyLevel(Publication.PrivacyLevel privacyLevel);
    List<Publication> findByTargetUserId(Long targetUserId);
    Page<Publication> findByTargetUserId(Long targetUserId, Pageable pageable);
    Page<Publication> findByUserIdOrTargetUserId(Long userId, Long targetUserId, Pageable pageable);

    // User's profile timeline: publications by the user or targeted at the user, excluding group posts
    @Query("SELECT p FROM Publication p WHERE " +
            "((p.user.id = :userId AND p.targetUser IS NULL) OR " +
            "(p.targetUser.id = :userId)) AND p.group IS NULL")
    Page<Publication> findUserTimelinePublications(@Param("userId") Long userId, Pageable pageable);

    Page<Publication> findByGroupId(Long groupId, Pageable pageable);

    // Home page: all non-group publications (own posts, cross-user posts) and group posts from groups the user is a member of
    @Query("SELECT p FROM Publication p WHERE " +
            "(p.user.id = :userId) OR " +
            "(p.privacyLevel = 'PUBLIC' AND p.group IS NULL) OR " +
            "(EXISTS (SELECT 1 FROM Group g JOIN g.members m WHERE g.id = p.group.id AND m.id = :userId))")
    Page<Publication> findPublicationsForUser(@Param("userId") Long userId, Pageable pageable);
    @Query("SELECT COUNT(p) FROM Publication p WHERE p.group.id = :groupId AND p.user.id = :userId")
    long countByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("SELECT p.createDate FROM Publication p WHERE p.group.id = :groupId AND p.user.id = :userId ORDER BY p.createDate DESC")
    List<LocalDateTime> findLastPublicationDateByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId, Pageable pageable);

}