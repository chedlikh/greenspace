package com.example.app.Service;

import com.example.app.Entities.Reaction;
import com.example.app.Repository.ReactionRepository;
import com.example.app.Service.IReactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReactionServiceImpl implements IReactionService {

    @Autowired
    private ReactionRepository reactionRepository;

    @Override
    public Reaction saveReaction(Reaction reaction) {
        // Check if user already reacted to this publication/comment
        if (reaction.getPublication() != null) {
            Optional<Reaction> existingReaction = findByUserIdAndPublicationId(
                    reaction.getUser().getId(),
                    reaction.getPublication().getId());

            if (existingReaction.isPresent()) {
                // Update existing reaction type
                Reaction existing = existingReaction.get();
                existing.setReactionType(reaction.getReactionType());
                return reactionRepository.save(existing);
            }
        } else if (reaction.getComment() != null) {
            Optional<Reaction> existingReaction = findByUserIdAndCommentId(
                    reaction.getUser().getId(),
                    reaction.getComment().getId());

            if (existingReaction.isPresent()) {
                // Update existing reaction type
                Reaction existing = existingReaction.get();
                existing.setReactionType(reaction.getReactionType());
                return reactionRepository.save(existing);
            }
        }

        // Create new reaction if none exists
        return reactionRepository.save(reaction);
    }

    @Override
    public void deleteReaction(Long id) {
        reactionRepository.deleteById(id);
    }

    @Override
    public Optional<Reaction> findById(Long id) {
        return reactionRepository.findById(id);
    }

    @Override
    public List<Reaction> findAll() {
        return reactionRepository.findAll();
    }

    @Override
    public List<Reaction> findByPublicationId(Long publicationId) {
        return reactionRepository.findByPublicationId(publicationId);
    }

    @Override
    public List<Reaction> findByCommentId(Long commentId) {
        return reactionRepository.findByCommentId(commentId);
    }

    @Override
    public Optional<Reaction> findByUserIdAndPublicationId(Long userId, Long publicationId) {
        return reactionRepository.findByUserIdAndPublicationId(userId, publicationId);
    }

    @Override
    public Optional<Reaction> findByUserIdAndCommentId(Long userId, Long commentId) {
        return reactionRepository.findByUserIdAndCommentId(userId, commentId);
    }

    @Override
    public Map<Reaction.ReactionType, Long> countReactionsByPublicationId(Long publicationId) {
        List<Reaction> reactions = findByPublicationId(publicationId);
        return reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getReactionType, Collectors.counting()));
    }

    @Override
    public Map<Reaction.ReactionType, Long> countReactionsByCommentId(Long commentId) {
        List<Reaction> reactions = findByCommentId(commentId);
        return reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getReactionType, Collectors.counting()));
    }

    @Override
    public long countTotalReactionsByPublicationId(Long publicationId) {
        return reactionRepository.countByPublicationId(publicationId);
    }

    @Override
    public long countTotalReactionsByCommentId(Long commentId) {
        return reactionRepository.countByCommentId(commentId);
    }
}