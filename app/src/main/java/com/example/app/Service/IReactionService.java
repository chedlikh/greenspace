package com.example.app.Service;

import com.example.app.Entities.Reaction;
import java.util.List;
import java.util.Optional;
import java.util.Map;

public interface IReactionService {
    Reaction saveReaction(Reaction reaction);
    void deleteReaction(Long id);
    Optional<Reaction> findById(Long id);
    List<Reaction> findAll();
    List<Reaction> findByPublicationId(Long publicationId);
    List<Reaction> findByCommentId(Long commentId);
    Optional<Reaction> findByUserIdAndPublicationId(Long userId, Long publicationId);
    Optional<Reaction> findByUserIdAndCommentId(Long userId, Long commentId);
    Map<Reaction.ReactionType, Long> countReactionsByPublicationId(Long publicationId);
    Map<Reaction.ReactionType, Long> countReactionsByCommentId(Long commentId);
    long countTotalReactionsByPublicationId(Long publicationId);
    long countTotalReactionsByCommentId(Long commentId);
}