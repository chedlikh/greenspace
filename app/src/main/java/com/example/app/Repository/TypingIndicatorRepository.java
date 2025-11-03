package com.example.app.Repository;

import com.example.app.Entities.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TypingIndicatorRepository extends JpaRepository<TypingIndicator, Long> {

    @Query("SELECT ti FROM TypingIndicator ti " +
            "WHERE ti.conversation.id = :conversationId " +
            "AND ti.user.id = :userId")
    Optional<TypingIndicator> findByConversationIdAndUserId(@Param("conversationId") Long conversationId,
                                                            @Param("userId") Long userId);

    @Query("SELECT ti FROM TypingIndicator ti " +
            "WHERE ti.conversation.id = :conversationId " +
            "AND ti.isTyping = true " +
            "AND ti.user.id != :excludeUserId")
    List<TypingIndicator> findTypingUsers(@Param("conversationId") Long conversationId,
                                          @Param("excludeUserId") Long excludeUserId);

    @Modifying
    @Query("UPDATE TypingIndicator ti SET ti.isTyping = false " +
            "WHERE ti.lastTypingDate < :timeout")
    int clearExpiredTypingIndicators(@Param("timeout") LocalDateTime timeout);

    @Modifying
    @Query("DELETE FROM TypingIndicator ti " +
            "WHERE ti.lastTypingDate < :timeout " +
            "AND ti.isTyping = false")
    int deleteOldTypingIndicators(@Param("timeout") LocalDateTime timeout);
}

