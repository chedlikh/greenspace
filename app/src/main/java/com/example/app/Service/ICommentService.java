package com.example.app.Service;

import com.example.app.Entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ICommentService {
    Comment saveComment(Comment comment);
    Comment updateComment(Long id, Comment comment);
    void deleteComment(Long id);
    Optional<Comment> findById(Long id);
    List<Comment> findAll();
    List<Comment> findByPublicationId(Long publicationId);
    Page<Comment> findByPublicationIdPaginated(Long publicationId, Pageable pageable);
    List<Comment> findByUserId(Long userId);
    List<Comment> findRepliesByCommentId(Long commentId);
    int countTotalCommentsAndReplies(Long publicationId);
}