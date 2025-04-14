package com.example.app.Service;

import com.example.app.Entities.Story;
import com.example.app.Entities.StoryView;
import com.example.app.Entities.User;
import com.example.app.Repository.StoryRepository;
import com.example.app.Repository.StoryViewRepository;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.IStoryService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoryServiceImpl implements IStoryService {

    private final StoryRepository storyRepository;
    private final UserRepo userRepository;
    private final StoryViewRepository storyViewRepository;
    private final SFileStorageService fileStorageService;

    @Autowired
    public StoryServiceImpl(StoryRepository storyRepository,
                            UserRepo userRepository,
                            StoryViewRepository storyViewRepository,
                            SFileStorageService fileStorageService) {
        this.storyRepository = storyRepository;
        this.userRepository = userRepository;
        this.storyViewRepository = storyViewRepository;
        this.fileStorageService = fileStorageService;
    }
    @Override
    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }


    @Override
    @Transactional
    public Story createMediaStory(String username, MultipartFile file, String caption) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));

        if (!fileStorageService.isImageFile(file) && !fileStorageService.isVideoFile(file)) {
            throw new RuntimeException("File must be an image or video");
        }

        String filename = fileStorageService.storeStoryMedia(file);

        Story story = new Story();
        story.setUser(user);
        story.setMediaUrl(filename);
        story.setCaption(caption);
        story.setMediaType(fileStorageService.isVideoFile(file) ? "VIDEO" : "IMAGE");
        story.setCreatedAt(LocalDateTime.now());
        story.setExpiresAt(LocalDateTime.now().plusHours(24));
        story.setActive(true);
        story.setViewCount(0);

        return storyRepository.save(story);
    }

    @Override
    @Transactional
    public Story createTextStory(String username, String textContent, String backgroundColor, String fontStyle) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));

        Story story = new Story();
        story.setUser(user);
        story.setTextContent(textContent);
        story.setBackgroundColor(backgroundColor);
        story.setFontStyle(fontStyle);
        story.setMediaType("TEXT");
        story.setCreatedAt(LocalDateTime.now());
        story.setExpiresAt(LocalDateTime.now().plusHours(24));
        story.setActive(true);
        story.setViewCount(0);

        return storyRepository.save(story);
    }

    @Override
    public Optional<Story> getStoryById(Long id) {
        return storyRepository.findById(id);
    }

    @Override
    public List<Story> getActiveStoriesByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));

        return storyRepository.findByUserAndIsActiveTrueAndExpiresAtAfter(user, LocalDateTime.now());
    }

    @Override
    public List<Story> getStoriesForFeed(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + username));

        List<User> followedUsers = getFollowedUsers(user);
        return storyRepository.findByUserInAndIsActiveTrueAndExpiresAtAfterOrderByCreatedAtDesc(
                followedUsers, LocalDateTime.now());
    }

    // This is a placeholder method - implement based on your specific model
    private List<User> getFollowedUsers(User user) {
        // Implement based on your friendship/following model
        // For now, return all users as a placeholder
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void deleteStory(Long id) {
        storyRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void viewStory(Long storyId, String viewerUsername) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with ID: " + storyId));

        User viewer = userRepository.findByUsername(viewerUsername)
                .orElseThrow(() -> new EntityNotFoundException("User not found with username: " + viewerUsername));

        Optional<StoryView> existingView = storyViewRepository.findByStoryAndViewer(story, viewer);

        if (existingView.isEmpty()) {
            StoryView storyView = new StoryView();
            storyView.setStory(story);
            storyView.setViewer(viewer);
            storyViewRepository.save(storyView);

            story.setViewCount(story.getViewCount() + 1);
            storyRepository.save(story);
        }
    }


    @Override
    public List<User> getUsersWithActiveStories() {
        return storyRepository.findUsersWithActiveStories(LocalDateTime.now());
    }

    @Override
    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void deactivateExpiredStories() {
        List<Story> expiredStories = storyRepository.findByIsActiveTrueAndExpiresAtBefore(LocalDateTime.now());

        for (Story story : expiredStories) {
            story.setActive(false);
            storyRepository.save(story);
        }
    }

    @Override
    @Transactional
    public Story updateStoryCaption(Long id, String caption) {
        Story story = storyRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with ID: " + id));

        story.setCaption(caption);
        return storyRepository.save(story);
    }

    // Additional method to get viewers of a story
    @Override
    public List<User> getStoryViewers(Long storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new EntityNotFoundException("Story not found with ID: " + storyId));

        List<StoryView> storyViews = storyViewRepository.findByStory(story);
        return storyViews.stream()
                .map(StoryView::getViewer)
                .collect(Collectors.toList());
    }
}