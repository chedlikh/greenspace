package com.example.app.Repository;

import com.example.app.Entities.Story;
import com.example.app.Entities.StoryView;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, Long> {

    // Find all viewers of a story
    List<StoryView> findByStory(Story story);

    // Find all stories viewed by a user
    List<StoryView> findByViewer(User viewer);

    // Check if a user has viewed a story
    Optional<StoryView> findByStoryAndViewer(Story story, User viewer);

    // Count views for a story
    Long countByStory(Story story);
}