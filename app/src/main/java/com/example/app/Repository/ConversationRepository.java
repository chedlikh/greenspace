package com.example.app.Repository;

import com.example.app.Entities.Conversation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT DISTINCT c FROM Conversation c " +
            "JOIN c.participants p " +
            "WHERE p.user.id = :userId AND p.isActive = true " +
            "ORDER BY c.updatedDate DESC")
    Page<Conversation> findByUserIdOrderByUpdatedDateDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT DISTINCT c FROM Conversation c " +
            "JOIN c.participants p1 " +
            "JOIN c.participants p2 " +
            "WHERE p1.user.id = :user1Id AND p2.user.id = :user2Id " +
            "AND c.isGroup = false " +
            "AND p1.isActive = true AND p2.isActive = true " +
            "AND p1 <> p2") // Ensures p1 and p2 are different participants
    Optional<Conversation> findDirectConversationBetweenUsers(
            @Param("user1Id") Long user1Id,
            @Param("user2Id") Long user2Id
    );

    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p " +
            "WHERE c.id = :conversationId AND p.user.id = :userId AND p.isActive = true")
    Optional<Conversation> findByIdAndUserId(@Param("conversationId") Long conversationId,
                                             @Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c " +
            "WHERE c.isGroup = true AND " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Conversation> searchGroupConversations(@Param("query") String query);

    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.id NOT IN (SELECT ms.message.id FROM MessageStatus ms " +
            "WHERE ms.user.id = :userId AND ms.status = 'READ' AND ms.message.conversation.id = :conversationId)")
    Long countUnreadMessages(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p " +
            "WHERE p.user.id = :userId AND p.isActive = true AND c.isArchived = true")
    List<Conversation> findArchivedConversationsByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Conversation c " +
            "JOIN c.participants p " +
            "WHERE p.user.id = :userId AND p.isActive = true AND c.isPinned = true")
    List<Conversation> findPinnedConversationsByUserId(@Param("userId") Long userId);

    // Added methods
    @Query("SELECT c FROM Conversation c WHERE c.isGroup = true")
    List<Conversation> findByIsGroupTrue();

    @Query("SELECT c FROM Conversation c WHERE c.isGroup = false")
    List<Conversation> findByIsGroupFalse();

}