package com.example.app.Repository;

import com.example.app.Entities.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    List<Reaction> findByPublicationId(Long publicationId);
    List<Reaction> findByCommentId(Long commentId);
    Optional<Reaction> findByUserIdAndPublicationId(Long userId, Long publicationId);
    Optional<Reaction> findByUserIdAndCommentId(Long userId, Long commentId);
    Long countByPublicationId(Long publicationId);
    Long countByCommentId(Long commentId);

    @Query("SELECT COUNT(r) FROM Reaction r WHERE r.publication.group.id = :groupId AND r.user.id = :userId")
    long countByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
}