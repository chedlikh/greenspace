package com.example.app.Repository;

import com.example.app.Entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPublicationIdAndParentCommentIsNull(Long publicationId);
    Page<Comment> findByPublicationIdAndParentCommentIsNull(Long publicationId, Pageable pageable);
    List<Comment> findByUserId(Long userId);
    List<Comment> findByParentCommentId(Long parentCommentId);
    int countByPublicationIdAndParentCommentIsNull(Long publicationId);
    int countByPublicationIdAndParentCommentIsNotNull(Long publicationId);
}