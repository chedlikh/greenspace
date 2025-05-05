package com.example.app.Repository;

import com.example.app.Entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPublicationIdAndParentCommentIsNull(Long publicationId);
    Page<Comment> findByPublicationIdAndParentCommentIsNull(Long publicationId, Pageable pageable);
    List<Comment> findByUserId(Long userId);
    List<Comment> findByParentCommentId(Long parentCommentId);
    int countByPublicationIdAndParentCommentIsNull(Long publicationId);
    int countByPublicationIdAndParentCommentIsNotNull(Long publicationId);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.publication.group.id = :groupId AND c.user.id = :userId")
    long countByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);

    @Query("SELECT c.createDate FROM Comment c WHERE c.publication.group.id = :groupId AND c.user.id = :userId ORDER BY c.createDate DESC")
    List<LocalDateTime> findLastCommentDateByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId, Pageable pageable);
}