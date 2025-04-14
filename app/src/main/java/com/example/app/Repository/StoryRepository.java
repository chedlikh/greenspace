package com.example.app.Repository;

import com.example.app.Entities.Story;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends JpaRepository<Story, Long> {

    // Find all active stories by user
    List<Story> findByUserAndIsActiveTrueAndExpiresAtAfter(User user, LocalDateTime now);

    // Find all active stories from a list of users (for feed)
    List<Story> findByUserInAndIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(List<User> users, LocalDateTime now);

    // Find all active stories
    List<Story> findByIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);

    // Find stories that need to be deactivated (expired)
    List<Story> findByIsActiveTrueAndExpiresAtBefore(LocalDateTime now);

    // Count active stories by user
    Long countByUserAndIsActiveTrueAndExpiresAtAfter(User user, LocalDateTime now);

    // Custom query to get users with active stories
    @Query("SELECT DISTINCT s.user FROM Story s WHERE s.isActive = true AND s.expiresAt > ?1 ORDER BY s.createdAt DESC")
    List<User> findUsersWithActiveStories(LocalDateTime now);
}