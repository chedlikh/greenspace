package com.example.app.Repository;

import com.example.app.Entities.CallParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CallParticipantRepository extends JpaRepository<CallParticipant, Long> {

    @Query("SELECT cp FROM CallParticipant cp " +
            "WHERE cp.call.id = :callId")
    List<CallParticipant> findByCallId(@Param("callId") Long callId);

    @Query("SELECT cp FROM CallParticipant cp " +
            "WHERE cp.call.id = :callId " +
            "AND cp.user.id = :userId")
    Optional<CallParticipant> findByCallIdAndUserId(@Param("callId") Long callId,
                                                    @Param("userId") Long userId);

    @Query("SELECT cp FROM CallParticipant cp " +
            "WHERE cp.call.id = :callId " +
            "AND cp.status = 'JOINED'")
    List<CallParticipant> findActiveParticipantsByCallId(@Param("callId") Long callId);

    @Query("SELECT COUNT(cp) FROM CallParticipant cp " +
            "WHERE cp.call.id = :callId " +
            "AND cp.status = 'JOINED'")
    Long countActiveParticipants(@Param("callId") Long callId);
}
