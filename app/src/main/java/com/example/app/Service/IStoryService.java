package com.example.app.Service;

import com.example.app.Entities.Story;
import com.example.app.Entities.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface IStoryService {
    Story createMediaStory(String username, MultipartFile file, String caption);
    Story createTextStory(String username, String textContent, String backgroundColor, String fontStyle);
    Optional<Story> getStoryById(Long id);
    List<Story> getActiveStoriesByUser(String username);
    List<Story> getStoriesForFeed(String username);
    void deleteStory(Long id);
    void viewStory(Long storyId, String viewerUsername);
    List<User> getUsersWithActiveStories();
    void deactivateExpiredStories();
    Story updateStoryCaption(Long id, String caption);
    List<Story> getAllStories();
    List<User> getStoryViewers(Long storyId);
}