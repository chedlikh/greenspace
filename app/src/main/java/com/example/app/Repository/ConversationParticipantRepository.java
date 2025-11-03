package com.example.app.Repository;

import com.example.app.Entities.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    @Query("SELECT cp FROM ConversationParticipant cp " +
            "WHERE cp.conversation.id = :conversationId " +
            "AND cp.isActive = true")
    List<ConversationParticipant> findActiveParticipantsByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT cp FROM ConversationParticipant cp " +
            "WHERE cp.conversation.id = :conversationId " +
            "AND cp.user.id = :userId")
    Optional<ConversationParticipant> findByConversationIdAndUserId(@Param("conversationId") Long conversationId,
                                                                    @Param("userId") Long userId);

    @Query("SELECT COUNT(cp) FROM ConversationParticipant cp " +
            "WHERE cp.conversation.id = :conversationId " +
            "AND cp.isActive = true")
    Long countActiveParticipants(@Param("conversationId") Long conversationId);

    @Query("SELECT cp FROM ConversationParticipant cp " +
            "WHERE cp.conversation.id = :conversationId " +
            "AND cp.role = 'ADMIN' " +
            "AND cp.isActive = true")
    List<ConversationParticipant> findAdminsByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT cp FROM ConversationParticipant cp " +
            "WHERE cp.conversation.id = :conversationId " +
            "AND cp.isBlocked = true")
    List<ConversationParticipant> findBlockedParticipants(@Param("conversationId") Long conversationId);
}
