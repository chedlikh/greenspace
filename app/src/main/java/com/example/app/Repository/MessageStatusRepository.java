package com.example.app.Repository;

import com.example.app.Entities.Message;
import com.example.app.Entities.MessageStatus;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, Long> {

    @Query("SELECT ms FROM MessageStatus ms WHERE ms.message = :message AND ms.user = :user")
    Optional<MessageStatus> findByMessageAndUser(@Param("message") Message message,
                                                 @Param("user") User user);
    @Query("SELECT ms FROM MessageStatus ms " +
            "WHERE ms.message.id = :messageId")
    List<MessageStatus> findByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT COUNT(ms) FROM MessageStatus ms " +
            "WHERE ms.message.conversation.id = :conversationId " +
            "AND ms.user.id = :userId " +
            "AND ms.status != 'READ'")
    Long countUnreadByConversationAndUser(@Param("conversationId") Long conversationId,
                                          @Param("userId") Long userId);

    @Query("SELECT ms FROM MessageStatus ms " +
            "WHERE ms.message.conversation.id = :conversationId " +
            "AND ms.user.id = :userId " +
            "AND ms.status = 'DELIVERED' " +
            "ORDER BY ms.statusDate ASC")
    List<MessageStatus> findUnreadMessages(@Param("conversationId") Long conversationId,
                                           @Param("userId") Long userId);

        @Query("SELECT ms FROM MessageStatus ms WHERE ms.message.id = :messageId AND ms.user.id = :userId")
        Optional<MessageStatus> findByMessageIdAndUserId(@Param("messageId") Long messageId,
                                                         @Param("userId") Long userId);

        @Query("SELECT ms FROM MessageStatus ms WHERE ms.message.id = :messageId AND ms.status = :status")
        List<MessageStatus> findByMessageIdAndStatus(@Param("messageId") Long messageId,
                                                     @Param("status") MessageStatus.Status status);

        @Query("SELECT ms FROM MessageStatus ms WHERE ms.message.conversation.id = :conversationId AND ms.user.id = :userId AND ms.status = 'DELIVERED'")
        List<MessageStatus> findDeliveredMessagesForUser(@Param("conversationId") Long conversationId,
                                                         @Param("userId") Long userId);


}
