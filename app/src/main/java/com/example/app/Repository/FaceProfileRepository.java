package com.example.app.Repository;


import com.example.app.Entities.FaceProfile;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FaceProfileRepository extends JpaRepository<FaceProfile, Long> {

    List<FaceProfile> findByUserAndIsActiveTrue(User user);

    boolean existsByUserAndProfileNameAndIsActiveTrue(User user, String profileName);

    @Modifying
    @Query("UPDATE FaceProfile fp SET fp.isActive = false WHERE fp.user = :user")
    void deactivateAllUserProfiles(@Param("user") User user);

    @Query("SELECT fp FROM FaceProfile fp WHERE fp.lastUsed < :cutoffDate AND fp.isActive = true")
    List<FaceProfile> findUnusedProfiles(@Param("cutoffDate") LocalDateTime cutoffDate);
    List<FaceProfile> findByLastUsedBeforeOrLastUsedIsNullAndIsActiveTrue(LocalDateTime cutoffDate);
}
