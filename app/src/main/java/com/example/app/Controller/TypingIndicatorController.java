package com.example.app.Controller;

import com.example.app.DTOs.TypingIndicatorDTO;
import com.example.app.DTOs.UserDTO;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.TypingIndicatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@Controller
@RequestMapping("/api/typing")
public class TypingIndicatorController {

    @Autowired
    private TypingIndicatorService typingIndicatorService;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private Long getUserIdFromAuthentication(Object authenticationSource) {
        String username;
        if (authenticationSource instanceof Authentication) {
            Authentication authentication = (Authentication) authenticationSource;
            if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
                throw new IllegalStateException("User not authenticated");
            }
            username = authentication.getName();
        } else if (authenticationSource instanceof Principal) {
            Principal principal = (Principal) authenticationSource;
            username = principal.getName();
        } else {
            throw new IllegalArgumentException("Unsupported authentication source type");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"))
                .getId();
    }

    // REST endpoints
    @PostMapping("/{conversationId}/start")
    public ResponseEntity<Void> startTyping(@PathVariable Long conversationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(authentication);
        typingIndicatorService.startTyping(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{conversationId}/stop")
    public ResponseEntity<Void> stopTyping(@PathVariable Long conversationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(authentication);
        typingIndicatorService.stopTyping(conversationId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<List<TypingIndicatorDTO>> getTypingUsers(@PathVariable Long conversationId) {
        return ResponseEntity.ok(typingIndicatorService.getTypingUsers(conversationId));
    }

    @GetMapping("/{conversationId}/usernames")
    public ResponseEntity<List<String>> getTypingUsernames(@PathVariable Long conversationId) {
        return ResponseEntity.ok(typingIndicatorService.getTypingUsernames(conversationId));
    }

    @GetMapping("/{conversationId}/is-typing")
    public ResponseEntity<Boolean> isUserTyping(@PathVariable Long conversationId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Long userId = getUserIdFromAuthentication(authentication);
        return ResponseEntity.ok(typingIndicatorService.isUserTyping(conversationId, userId));
    }

    // WebSocket endpoints
    @MessageMapping("/typing/start")
    public void handleStartTyping(@Payload TypingIndicatorDTO payload, Principal principal) {
        System.out.println("Received /typing/start payload: " + payload);
        Long conversationId = payload.getConversationId();
        Long userId = getUserIdFromAuthentication(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        typingIndicatorService.startTyping(conversationId, userId);

        TypingIndicatorDTO indicator = new TypingIndicatorDTO();
        indicator.setConversationId(conversationId);
        UserDTO userDTO = new UserDTO();
        userDTO.setId(userId);
        userDTO.setUsername(user.getUsername());
        userDTO.setFirstname(user.getFirstname());
        userDTO.setLastName(user.getLastName());
        indicator.setUser(userDTO);
        indicator.setTyping(true);
        indicator.setLastTypingDate(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", indicator);
    }

    @MessageMapping("/typing/stop")
    public void handleStopTyping(@Payload TypingIndicatorDTO payload, Principal principal) {
        System.out.println("Received /typing/stop payload: " + payload);
        Long conversationId = payload.getConversationId();
        Long userId = getUserIdFromAuthentication(principal);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("User not found"));

        typingIndicatorService.stopTyping(conversationId, userId);

        TypingIndicatorDTO indicator = new TypingIndicatorDTO();
        indicator.setConversationId(conversationId);
        UserDTO userDTO = new UserDTO();
        userDTO.setId(userId);
        userDTO.setUsername(user.getUsername());
        userDTO.setFirstname(user.getFirstname());
        userDTO.setLastName(user.getLastName());
        indicator.setUser(userDTO);
        indicator.setTyping(false);
        indicator.setLastTypingDate(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/typing", indicator);
    }
}