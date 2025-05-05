package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Comment;
import com.example.app.Entities.Publication;
import com.example.app.Entities.Reaction;
import com.example.app.Entities.User;
import com.example.app.Mappers.ReactionMapper;
import com.example.app.Service.ICommentService;
import com.example.app.Service.IPublicationService;
import com.example.app.Service.IReactionService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    @Autowired
    private IReactionService reactionService;

    @Autowired
    private IPublicationService publicationService;

    @Autowired
    private ICommentService commentService;

    @Autowired
    private ReactionMapper reactionMapper;

    @PostMapping("/publication/{publicationId}")
    public ResponseEntity<ReactionDTO> reactToPublication(
            @PathVariable Long publicationId,
            @RequestParam Reaction.ReactionType reactionType) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Publication publication = publicationService.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

        Reaction reaction = new Reaction();
        reaction.setUser(currentUser);
        reaction.setPublication(publication);
        reaction.setReactionType(reactionType);

        Reaction savedReaction = reactionService.saveReaction(reaction);
        return new ResponseEntity<>(reactionMapper.toDto(savedReaction), HttpStatus.CREATED);
    }

    @PostMapping("/comment/{commentId}")
    public ResponseEntity<ReactionDTO> reactToComment(
            @PathVariable Long commentId,
            @RequestParam Reaction.ReactionType reactionType) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Comment comment = commentService.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));

        Reaction reaction = new Reaction();
        reaction.setUser(currentUser);
        reaction.setComment(comment);
        reaction.setReactionType(reactionType);

        Reaction savedReaction = reactionService.saveReaction(reaction);
        return new ResponseEntity<>(reactionMapper.toDto(savedReaction), HttpStatus.CREATED);
    }

    @GetMapping("/publication/{publicationId}/count")
    public ResponseEntity<ReactionCountDTO> countReactionsByPublicationId(
            @PathVariable Long publicationId) {

        Map<Reaction.ReactionType, Long> reactionCounts =
                reactionService.countReactionsByPublicationId(publicationId);

        ReactionCountDTO dto = new ReactionCountDTO();
        dto.setCounts(reactionCounts);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/comment/{commentId}/count")
    public ResponseEntity<ReactionCountDTO> countReactionsByCommentId(
            @PathVariable Long commentId) {

        Map<Reaction.ReactionType, Long> reactionCounts =
                reactionService.countReactionsByCommentId(commentId);

        ReactionCountDTO dto = new ReactionCountDTO();
        dto.setCounts(reactionCounts);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/publication/{publicationId}/user")
    public ResponseEntity<?> getUserReactionForPublication(
            @PathVariable Long publicationId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Optional<Reaction> reaction = reactionService.findByUserIdAndPublicationId(currentUser.getId(), publicationId);

        // Return 200 OK with empty body when no reaction exists
        return reaction.map(value -> new ResponseEntity<>(reactionMapper.toDto(value), HttpStatus.OK))
                .orElseGet(() -> ResponseEntity.ok().build());
    }

    @GetMapping("/comment/{commentId}/user")
    public ResponseEntity<ReactionDTO> getUserReactionForComment(
            @PathVariable Long commentId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        return reactionService.findByUserIdAndCommentId(currentUser.getId(), commentId)
                .map(reaction -> new ResponseEntity<>(reactionMapper.toDto(reaction), HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReaction(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Reaction existingReaction = reactionService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reaction not found with id: " + id));

        if (!existingReaction.getUser().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        reactionService.deleteReaction(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/publication/{publicationId}")
    public ResponseEntity<List<ReactionDTO>> getReactionsByPublicationId(
            @PathVariable Long publicationId) {

        publicationService.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

        List<Reaction> reactions = reactionService.findByPublicationId(publicationId);
        List<ReactionDTO> reactionDTOs = reactions.stream()
                .map(reactionMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reactionDTOs);
    }

    @GetMapping("/comment/{commentId}")
    public ResponseEntity<List<ReactionDTO>> getReactionsByCommentId(
            @PathVariable Long commentId) {

        commentService.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment not found with id: " + commentId));

        List<Reaction> reactions = reactionService.findByCommentId(commentId);
        List<ReactionDTO> reactionDTOs = reactions.stream()
                .map(reactionMapper::toDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(reactionDTOs);
    }
}