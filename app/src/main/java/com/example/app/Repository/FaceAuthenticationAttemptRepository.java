package com.example.app.Repository;


import com.example.app.Entities.FaceAuthenticationAttempt;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FaceAuthenticationAttemptRepository extends JpaRepository<FaceAuthenticationAttempt, Long> {

    List<FaceAuthenticationAttempt> findByUserOrderByAttemptTimeDesc(User user);

    @Query("SELECT COUNT(faa) FROM FaceAuthenticationAttempt faa WHERE faa.ipAddress = :ipAddress AND faa.attemptTime > :since")
    long countByIpAddressAndAttemptTimeAfter(@Param("ipAddress") String ipAddress, @Param("since") LocalDateTime since);

    @Modifying
    @Query("DELETE FROM FaceAuthenticationAttempt faa WHERE faa.attemptTime < :cutoffDate")
    void deleteOldAttempts(@Param("cutoffDate") LocalDateTime cutoffDate);
    void deleteByAttemptTimeBefore(LocalDateTime cutoffDate);

}
