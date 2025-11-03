package com.example.app.Repository;

import com.example.app.Entities.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    @Query("SELECT mr FROM MessageReaction mr " +
            "WHERE mr.message.id = :messageId")
    List<MessageReaction> findByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT mr FROM MessageReaction mr " +
            "WHERE mr.message.id = :messageId " +
            "AND mr.user.id = :userId")
    Optional<MessageReaction> findByMessageIdAndUserId(@Param("messageId") Long messageId,
                                                       @Param("userId") Long userId);

    @Query("SELECT mr.emoji, COUNT(mr) FROM MessageReaction mr " +
            "WHERE mr.message.id = :messageId " +
            "GROUP BY mr.emoji")
    List<Object[]> countReactionsByMessageId(@Param("messageId") Long messageId);
}
