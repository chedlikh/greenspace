package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Comment;
import com.example.app.Entities.Publication;
import com.example.app.Entities.User;
import com.example.app.Mappers.CommentMapper;
import com.example.app.Service.ICommentService;
import com.example.app.Service.IPublicationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private ICommentService commentService;

    @Autowired
    private IPublicationService publicationService;

    @Autowired
    private CommentMapper commentMapper;

    @PostMapping("/publication/{publicationId}")
    public ResponseEntity<CommentDTO> addCommentToPublication(
            @PathVariable Long publicationId,
            @RequestBody CommentCreateDTO commentDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Publication publication = publicationService.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

        // The service layer will check commenting restrictions
        Comment comment = commentMapper.toEntity(commentDto);
        comment.setUser(currentUser);
        comment.setPublication(publication);

        Comment savedComment = commentService.saveComment(comment);
        return new ResponseEntity<>(commentMapper.toDto(savedComment), HttpStatus.CREATED);
    }

    @PostMapping("/reply/{parentCommentId}")
    public ResponseEntity<CommentDTO> replyToComment(
            @PathVariable Long parentCommentId,
            @RequestBody CommentCreateDTO replyDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Comment parentComment = commentService.findById(parentCommentId)
                .orElseThrow(() -> new EntityNotFoundException("Parent comment not found with id: " + parentCommentId));

        // The service layer will check commenting restrictions
        Comment reply = commentMapper.toEntity(replyDto);
        reply.setUser(currentUser);
        reply.setPublication(parentComment.getPublication());
        reply.setParentComment(parentComment);

        Comment savedReply = commentService.saveComment(reply);
        return new ResponseEntity<>(commentMapper.toDto(savedReply), HttpStatus.CREATED);
    }

    @GetMapping("/publication/{publicationId}")
    public ResponseEntity<Page<CommentDTO>> getCommentsByPublicationId(
            @PathVariable Long publicationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createDate"));
        Page<Comment> comments = commentService.findByPublicationIdPaginated(publicationId, pageable);

        Page<CommentDTO> dtoPage = comments.map(commentMapper::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/replies/{commentId}")
    public ResponseEntity<List<CommentDTO>> getRepliesByCommentId(@PathVariable Long commentId) {
        List<Comment> replies = commentService.findRepliesByCommentId(commentId);
        List<CommentDTO> dtos = replies.stream()
                .map(commentMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO> updateComment(
            @PathVariable Long id,
            @RequestBody CommentUpdateDTO commentDetails) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Comment existingComment = commentService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + id));

        if (!existingComment.getUser().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        existingComment.setContent(commentDetails.getContent());
        existingComment.setIsEdited(true);

        Comment updatedComment = commentService.updateComment(id, existingComment);
        return ResponseEntity.ok(commentMapper.toDto(updatedComment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Comment existingComment = commentService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + id));

        if (!existingComment.getUser().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        commentService.deleteComment(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/publication/{publicationId}/count")
    public ResponseEntity<Integer> getTotalCommentsAndRepliesCount(@PathVariable Long publicationId) {
        int totalCount = commentService.countTotalCommentsAndReplies(publicationId);
        return ResponseEntity.ok(totalCount);
    }
}