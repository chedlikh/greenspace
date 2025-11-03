package com.example.app.Repository;

import com.example.app.Entities.Call;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CallRepository extends JpaRepository<Call, Long> {

    @Query("SELECT c FROM Call c " +
            "WHERE c.conversation.id = :conversationId " +
            "ORDER BY c.startedDate DESC")
    Page<Call> findByConversationIdOrderByStartedDateDesc(@Param("conversationId") Long conversationId,
                                                          Pageable pageable);
    @Query("SELECT c FROM Call c LEFT JOIN FETCH c.conversation LEFT JOIN FETCH c.participants WHERE c.id = :callId")
    Optional<Call> findByIdWithConversationAndParticipants(@Param("callId") Long callId);
    @Query("SELECT c FROM Call c " +
            "JOIN c.participants cp " +
            "WHERE cp.user.id = :userId " +
            "ORDER BY c.startedDate DESC")
    Page<Call> findByUserIdOrderByStartedDateDesc(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT c FROM Call c " +
            "WHERE c.status IN :statuses " +
            "AND c.conversation.id = :conversationId")
    Optional<Call> findActiveCallByConversationId(@Param("statuses") List<Call.CallStatus> statuses,
                                                  @Param("conversationId") Long conversationId);

    @Query("SELECT c FROM Call c " +
            "JOIN c.participants cp " +
            "WHERE cp.user.id = :userId " +
            "AND c.status IN :statuses")
    List<Call> findActiveCallsByUserId(@Param("userId") Long userId,
                                       @Param("statuses") List<Call.CallStatus> statuses);

    @Query("SELECT c FROM Call c " +
            "WHERE c.status = :status")
    List<Call> findByStatus(@Param("status") Call.CallStatus status);

    @Query("SELECT c FROM Call c " +
            "WHERE c.status = :status " +
            "AND c.startedDate < :timeout")
    List<Call> findTimedOutCalls(@Param("status") Call.CallStatus status,
                                 @Param("timeout") LocalDateTime timeout);
    @Query("SELECT c FROM Call c " +
            "LEFT JOIN FETCH c.participants p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH c.initiatedBy " +
            "LEFT JOIN FETCH c.conversation " +
            "WHERE c.id = :callId")
    Optional<Call> findByIdWithParticipants(@Param("callId") Long callId);
}