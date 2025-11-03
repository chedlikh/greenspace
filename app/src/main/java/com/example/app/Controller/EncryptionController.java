package com.example.app.Controller;

import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.EncryptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/encryption")
public class EncryptionController {

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    private UserRepo userRepository; // Inject UserRepository to fetch user ID

    // Get current user ID from JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName(); // Get username from JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @PostMapping("/message/encrypt/{conversationId}")
    public ResponseEntity<String> encryptMessageContent(
            @PathVariable Long conversationId,
            @RequestBody String content
    ) {
        return ResponseEntity.ok(encryptionService.encryptMessageContent(content, conversationId));
    }

    @PostMapping("/message/decrypt/{conversationId}")
    public ResponseEntity<String> decryptMessageContent(
            @PathVariable Long conversationId,
            @RequestBody String encryptedContent
    ) {
        return ResponseEntity.ok(encryptionService.decryptMessageContent(encryptedContent, conversationId));
    }

    @PostMapping("/key/generate/{conversationId}")
    public ResponseEntity<Void> generateConversationKey(@PathVariable Long conversationId) {
        encryptionService.generateConversationKey(conversationId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/key/{conversationId}")
    public ResponseEntity<String> getConversationKey(@PathVariable Long conversationId) {
        return ResponseEntity.ok(encryptionService.getConversationKey(conversationId, getCurrentUserId()));
    }

    @PostMapping("/key/rotate/{conversationId}")
    public ResponseEntity<Void> rotateConversationKey(@PathVariable Long conversationId) {
        encryptionService.rotateConversationKey(conversationId);
        return ResponseEntity.ok().build();
    }
}