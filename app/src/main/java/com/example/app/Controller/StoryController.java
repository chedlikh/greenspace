package com.example.app.Controller;

import com.example.app.Entities.Story;
import com.example.app.Entities.User;
import com.example.app.Service.JwtService;
import com.example.app.Service.StoryServiceImpl;
import com.example.app.Service.IStoryService;
import com.example.app.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stories")
public class StoryController {

    private final IStoryService storyService;
    private final String storyUploadDir = "uploads/story";
    private final JwtService jwtService;
    private final UserService userService;

    @Autowired
    public StoryController(IStoryService storyService,JwtService jwtService,UserService userService) {
        this.storyService = storyService;
        this.jwtService = jwtService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<Story>> getAllStories() {
        List<Story> stories = storyService.getAllStories();
        return new ResponseEntity<>(stories, HttpStatus.OK);
    }

    @PostMapping("/media/user/{username}")
    public ResponseEntity<Story> createMediaStory(
            @PathVariable String username,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption) {

        Story createdStory = storyService.createMediaStory(username, file, caption);
        return new ResponseEntity<>(createdStory, HttpStatus.CREATED);
    }

    @PostMapping("/text/user/{username}")
    public ResponseEntity<Story> createTextStory(
            @PathVariable String username,
            @RequestParam("text") String textContent,
            @RequestParam(value = "backgroundColor", required = false, defaultValue = "#FFFFFF") String backgroundColor,
            @RequestParam(value = "fontStyle", required = false, defaultValue = "Arial") String fontStyle) {

        Story createdStory = storyService.createTextStory(username, textContent, backgroundColor, fontStyle);
        return new ResponseEntity<>(createdStory, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryById(@PathVariable Long id) {
        Optional<Story> story = storyService.getStoryById(id);
        return story.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<Story>> getActiveStoriesByUser(@PathVariable String username) {
        List<Story> stories = storyService.getActiveStoriesByUser(username);
        return new ResponseEntity<>(stories, HttpStatus.OK);
    }

    @GetMapping("/feed/{username}")
    public ResponseEntity<List<Story>> getStoriesForFeed(@PathVariable String username) {
        List<Story> stories = storyService.getStoriesForFeed(username);
        return new ResponseEntity<>(stories, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        storyService.deleteStory(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{storyId}/view/{viewerUsername}")
    public ResponseEntity<Void> viewStory(
            @PathVariable Long storyId,
            @PathVariable String viewerUsername) {
        storyService.viewStory(storyId, viewerUsername);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/users-with-stories")
    public ResponseEntity<List<User>> getUsersWithActiveStories() {
        List<User> users = storyService.getUsersWithActiveStories();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PatchMapping("/{id}/caption")
    public ResponseEntity<Story> updateStoryCaption(
            @PathVariable Long id,
            @RequestParam("caption") String caption) {

        Story updatedStory = storyService.updateStoryCaption(id, caption);
        return new ResponseEntity<>(updatedStory, HttpStatus.OK);
    }

    @PostMapping("/expire")
    public ResponseEntity<Void> deactivateExpiredStories() {
        storyService.deactivateExpiredStories();
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @GetMapping("/{storyId}/viewers")
    public ResponseEntity<List<User>> getStoryViewers(@PathVariable Long storyId) {
        List<User> viewers = storyService.getStoryViewers(storyId);
        return new ResponseEntity<>(viewers, HttpStatus.OK);
    }

    @GetMapping("/media/{filename:.+}")
    public ResponseEntity<Resource> getStoryMedia(
            @PathVariable String filename,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authHeader) {

        try {
            // Validate Authorization header format
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
            }

            // Extract and validate token
            String token = authHeader.substring(7);
            String username = jwtService.extractUsername(token);
            UserDetails userDetails = userService.loadUserByUsername(username);

            if (!jwtService.isValid(token, userDetails)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
            }

            // Serve the file
            Path filePath = Paths.get(storyUploadDir).resolve(filename).normalize();

            if (!Files.exists(filePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            Resource resource = new UrlResource(filePath.toUri());
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);

        } catch (ResponseStatusException e) {
            throw e; // Re-throw our explicit exceptions
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error serving media", e);
        }
    }
}