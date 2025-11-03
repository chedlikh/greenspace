package com.example.app.Repository;

import com.example.app.Entities.MessageAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageAttachmentRepository extends JpaRepository<MessageAttachment, Long> {
    Optional<MessageAttachment> findById(Long id);
    Optional<MessageAttachment> findByFilePath(String filePath);

    @Query("SELECT ma FROM MessageAttachment ma " +
            "WHERE ma.message.id = :messageId")
    List<MessageAttachment> findByMessageId(@Param("messageId") Long messageId);

    @Query("SELECT ma FROM MessageAttachment ma " +
            "WHERE ma.message.conversation.id = :conversationId " +
            "AND ma.type = :attachmentType " +
            "ORDER BY ma.message.sentDate DESC")
    List<MessageAttachment> findByConversationIdAndType(@Param("conversationId") Long conversationId,
                                                        @Param("attachmentType") String attachmentType);

    @Query("SELECT SUM(ma.fileSize) FROM MessageAttachment ma " +
            "WHERE ma.message.conversation.id = :conversationId")
    Long calculateTotalSizeByConversationId(@Param("conversationId") Long conversationId);

    // Added method
    @Query("SELECT ma FROM MessageAttachment ma " +
            "WHERE ma.message.sentDate BETWEEN :startDate AND :endDate")
    List<MessageAttachment> findByMessageSentDateBetween(@Param("startDate") LocalDateTime startDate,
                                                         @Param("endDate") LocalDateTime endDate);
    @Query("SELECT ma FROM MessageAttachment ma " +
            "WHERE LOWER(ma.fileName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<MessageAttachment> findByFileNameContainingIgnoreCase(@Param("query") String query);
}