package com.example.app.Repository;

import com.example.app.Entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Logger logger = Logger.getLogger(MessageRepository.class.getName());

    List<Message> findByReplyTo(Message replyTo);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    Page<Message> findByConversationIdOrderBySentDateDesc(@Param("conversationId") Long conversationId,
                                                          Pageable pageable);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.isDeleted = false " +
            "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY m.sentDate DESC")
    Page<Message> searchMessagesInConversation(@Param("conversationId") Long conversationId,
                                               @Param("query") String query,
                                               Pageable pageable);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sentDate BETWEEN :fromDate AND :toDate " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    Page<Message> findMessagesByDateRange(@Param("conversationId") Long conversationId,
                                          @Param("fromDate") LocalDateTime fromDate,
                                          @Param("toDate") LocalDateTime toDate,
                                          Pageable pageable);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id = :senderId " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    Page<Message> findMessagesBySender(@Param("conversationId") Long conversationId,
                                       @Param("senderId") Long senderId,
                                       Pageable pageable);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.type = :messageType " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    Page<Message> findMessagesByType(@Param("conversationId") Long conversationId,
                                     @Param("messageType") Message.MessageType messageType,
                                     Pageable pageable);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sentDate > :afterDate " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    List<Message> findNewMessages(@Param("conversationId") Long conversationId,
                                  @Param("afterDate") LocalDateTime afterDate);

    @Query("SELECT COUNT(m) FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.isDeleted = false")
    Long countMessagesByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.isPinned = true " +
            "AND m.isDeleted = false " +
            "ORDER BY m.sentDate DESC")
    List<Message> findPinnedMessages(@Param("conversationId") Long conversationId);

    @Query("SELECT m FROM Message m " +
            "WHERE m.sender.id = :senderId " +
            "AND m.isDeleted = false")
    List<Message> findBySenderId(@Param("senderId") Long senderId);

    @Query("SELECT m FROM Message m " +
            "WHERE m.sentDate > :date " +
            "AND m.isDeleted = false")
    List<Message> findBySentDateAfter(@Param("date") LocalDateTime date);

    @Query("SELECT m FROM Message m " +
            "WHERE m.sentDate BETWEEN :start AND :end " +
            "AND m.isDeleted = false")
    List<Message> findBySentDateBetween(@Param("start") LocalDateTime start,
                                        @Param("end") LocalDateTime end);
    @Query("SELECT m FROM Message m " +
            "WHERE m.conversation.id = :conversationId " +
            "AND m.sender.id != :userId " +
            "AND NOT EXISTS (SELECT ms FROM MessageStatus ms " +
            "WHERE ms.message = m AND ms.user.id = :userId AND ms.status = 'READ') " +
            "ORDER BY m.sentDate DESC")
    List<Message> findUnreadMessagesForUser(@Param("conversationId") Long conversationId,
                                            @Param("userId") Long userId);
}