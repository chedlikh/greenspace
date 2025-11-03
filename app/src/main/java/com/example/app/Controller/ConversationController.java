package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.ConversationParticipant;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ConversationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    @Autowired
    private ConversationService conversationService;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get current user ID from JWT for REST endpoints
    private Long getCurrentUserId(Object authenticationSource) {
        String username;

        if (authenticationSource instanceof Authentication) {
            Authentication authentication = (Authentication) authenticationSource;
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
                throw new IllegalStateException("User not authenticated");
            }
            username = authentication.getName();
        } else {
            throw new IllegalArgumentException("Unsupported authentication source type");
        }

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"))
                .getId();
    }

    // REST Endpoints

    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(@Valid @RequestBody CreateConversationDTO createDTO) {
        Long creatorId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationDTO conversation = conversationService.createConversation(createDTO, creatorId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }

    @PostMapping("/direct")
    public ResponseEntity<ConversationDTO> createDirectConversation(@RequestParam Long otherUserId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationDTO conversation = conversationService.createDirectConversation(userId, otherUserId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }

    @PostMapping("/group")
    public ResponseEntity<ConversationDTO> createGroupConversation(
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam List<Long> participantIds) {
        Long creatorId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        CreateConversationDTO createDTO = new CreateConversationDTO();
        createDTO.setName(name);
        createDTO.setGroupDescription(description);
        createDTO.setGroup(true);
        createDTO.setParticipantIds(participantIds);
        ConversationDTO conversation = conversationService.createConversation(createDTO, creatorId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        return new ResponseEntity<>(conversation, HttpStatus.CREATED);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationDTO> getConversationById(@PathVariable Long conversationId) {
        Optional<ConversationDTO> conversation = conversationService.getConversationById(conversationId);
        return conversation.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getUserConversations() {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        List<ConversationDTO> conversations = conversationService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<ConversationDTO>> getUserConversationsPaginated(Pageable pageable) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        Page<ConversationDTO> conversations = conversationService.getUserConversationsPaginated(userId, pageable);
        return ResponseEntity.ok(conversations);
    }

    @PutMapping("/{conversationId}")
    public ResponseEntity<ConversationDTO> updateConversation(
            @PathVariable Long conversationId,
            @Valid @RequestBody ConversationDTO conversationDTO) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationDTO updated = conversationService.updateConversation(conversationId, conversationDTO, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long conversationId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        conversationService.deleteConversation(conversationId, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, Map.of("id", conversationId, "action", "deleted"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{conversationId}/participants")
    public ResponseEntity<ConversationParticipantDTO> addParticipant(
            @PathVariable Long conversationId,
            @RequestParam Long userId,
            @RequestParam String role) {
        Long addedByUserId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationParticipant.ParticipantRole participantRole = ConversationParticipant.ParticipantRole.valueOf(role.toUpperCase());
        ConversationParticipantDTO participant = conversationService.addParticipant(conversationId, userId, addedByUserId, participantRole);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant", participant);
        return new ResponseEntity<>(participant, HttpStatus.CREATED);
    }

    @PostMapping("/{conversationId}/participants/bulk")
    public ResponseEntity<List<ConversationParticipantDTO>> addMultipleParticipants(
            @PathVariable Long conversationId,
            @RequestBody List<Long> userIds) {
        Long addedByUserId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        List<ConversationParticipantDTO> participants = conversationService.addMultipleParticipants(conversationId, userIds, addedByUserId);
        participants.forEach(participant ->
                messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant", participant));
        return new ResponseEntity<>(participants, HttpStatus.CREATED);
    }

    @DeleteMapping("/{conversationId}/participants/{userId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable Long conversationId,
            @PathVariable Long userId) {
        Long removedByUserId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        conversationService.removeParticipant(conversationId, userId, removedByUserId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant",
                Map.of("userId", userId, "action", "removed"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{conversationId}/leave")
    public ResponseEntity<Void> leaveConversation(@PathVariable Long conversationId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        conversationService.leaveConversation(conversationId, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant",
                Map.of("userId", userId, "action", "removed"));
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{conversationId}/participants/{userId}/role")
    public ResponseEntity<ConversationParticipantDTO> updateParticipantRole(
            @PathVariable Long conversationId,
            @PathVariable Long userId,
            @RequestParam String role) {
        Long updatedByUserId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationParticipant.ParticipantRole participantRole = ConversationParticipant.ParticipantRole.valueOf(role.toUpperCase());
        ConversationParticipantDTO participant = conversationService.updateParticipantRole(conversationId, userId, participantRole, updatedByUserId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/participant", participant);
        return ResponseEntity.ok(participant);
    }

    @GetMapping("/{conversationId}/participants")
    public ResponseEntity<List<ConversationParticipantDTO>> getConversationParticipants(@PathVariable Long conversationId) {
        List<ConversationParticipantDTO> participants = conversationService.getConversationParticipants(conversationId);
        return ResponseEntity.ok(participants);
    }

    @GetMapping("/{conversationId}/participants/{userId}/exists")
    public ResponseEntity<Boolean> isUserParticipant(
            @PathVariable Long conversationId,
            @PathVariable Long userId) {
        boolean isParticipant = conversationService.isUserParticipant(conversationId, userId);
        return ResponseEntity.ok(isParticipant);
    }

    @GetMapping("/{conversationId}/participants/{userId}/admin")
    public ResponseEntity<Boolean> isUserAdmin(
            @PathVariable Long conversationId,
            @PathVariable Long userId) {
        boolean isAdmin = conversationService.isUserAdmin(conversationId, userId);
        return ResponseEntity.ok(isAdmin);
    }

    @GetMapping("/search")
    public ResponseEntity<List<ConversationDTO>> searchConversations(@RequestParam String query) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        List<ConversationDTO> conversations = conversationService.searchConversations(userId, query);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ConversationDTO>> getActiveConversations() {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        List<ConversationDTO> conversations = conversationService.getActiveConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/archived")
    public ResponseEntity<List<ConversationDTO>> getArchivedConversations() {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        List<ConversationDTO> conversations = conversationService.getArchivedConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @PutMapping("/{conversationId}/group")
    public ResponseEntity<ConversationDTO> updateGroupDetails(
            @PathVariable Long conversationId,
            @RequestParam String name,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String groupImage) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationDTO updated = conversationService.updateGroupDetails(conversationId, name, description, groupImage, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, updated);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{conversationId}/group/image")
    public ResponseEntity<ConversationDTO> updateGroupImage(
            @PathVariable Long conversationId,
            @RequestParam String imagePath) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        ConversationDTO updated = conversationService.updateGroupImage(conversationId, imagePath, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId, updated);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/{conversationId}/notifications")
    public ResponseEntity<Void> updateNotificationSettings(
            @PathVariable Long conversationId,
            @RequestParam boolean enabled) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        conversationService.updateNotificationSettings(conversationId, userId, enabled);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{conversationId}/last-seen")
    public ResponseEntity<Void> updateLastSeen(@PathVariable Long conversationId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        conversationService.updateLastSeen(conversationId, userId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{conversationId}/participants/online")
    public ResponseEntity<List<String>> getOnlineParticipants(@PathVariable Long conversationId) {
        List<String> onlineParticipants = conversationService.getOnlineParticipants(conversationId);
        return ResponseEntity.ok(onlineParticipants);
    }

    @GetMapping("/direct/existing")
    public ResponseEntity<ConversationDTO> getExistingDirectConversation(@RequestParam Long otherUserId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        Optional<ConversationDTO> conversation = conversationService.getExistingDirectConversation(userId, otherUserId);
        return conversation.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/direct/get-or-create")
    public ResponseEntity<ConversationDTO> getOrCreateDirectConversation(@RequestParam Long otherUserId) {
        Long userId = getCurrentUserId(SecurityContextHolder.getContext().getAuthentication());
        try {
            ConversationDTO conversation = conversationService.getOrCreateDirectConversation(userId, otherUserId);
            messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
            return ResponseEntity.ok(conversation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    // WebSocket Endpoints

    @MessageMapping("/conversation/create")
    public void createConversationWS(@Valid @Payload CreateConversationDTO createDTO) {
        if (createDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in create conversation payload");
            return;
        }
        Long creatorId = Long.parseLong(createDTO.getUserId());
        ConversationDTO conversation = conversationService.createConversation(createDTO, creatorId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "new", "conversation", conversation));
    }

    @MessageMapping("/conversation/direct")
    public void createDirectConversationWS(@Payload DirectConversationDTO directDTO) {
        if (directDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in direct conversation payload");
            return;
        }
        Long userId = Long.parseLong(directDTO.getUserId());
        ConversationDTO conversation = conversationService.createDirectConversation(userId, directDTO.getOtherUserId());
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "new", "conversation", conversation));
    }

    @MessageMapping("/conversation/group")
    public void createGroupConversationWS(@Valid @Payload GroupConversationDTO groupDTO) {
        if (groupDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in group conversation payload");
            return;
        }
        Long creatorId = Long.parseLong(groupDTO.getUserId());
        CreateConversationDTO createDTO = new CreateConversationDTO();
        createDTO.setName(groupDTO.getName());
        createDTO.setGroupDescription(groupDTO.getDescription());
        createDTO.setGroup(true);
        createDTO.setTheme(groupDTO.getTheme());
        createDTO.setParticipantIds(groupDTO.getParticipantIds());
        createDTO.setUserId(groupDTO.getUserId());
        ConversationDTO conversation = conversationService.createConversation(createDTO, creatorId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversation.getId(), conversation);
        messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "new", "conversation", conversation));
    }

    @MessageMapping("/conversation/update")
    public void updateConversationWS(@Valid @Payload ConversationDTO conversationDTO) {
        if (conversationDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in update conversation payload");
            return;
        }
        Long userId = Long.parseLong(conversationDTO.getUserId());
        ConversationDTO updated = conversationService.updateConversation(conversationDTO.getId(), conversationDTO, userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationDTO.getId(), updated);
        messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "updated", "conversation", updated));
    }

    @MessageMapping("/conversation/delete")
    public void deleteConversationWS(@Payload ConversationActionDTO actionDTO) {
        if (actionDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in delete conversation payload");
            return;
        }
        Long userId = Long.parseLong(actionDTO.getUserId());
        conversationService.deleteConversation(actionDTO.getConversationId(), userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + actionDTO.getConversationId(), Map.of("id", actionDTO.getConversationId(), "action", "deleted"));
        messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "deleted", "conversationId", actionDTO.getConversationId()));
    }

    @MessageMapping("/conversation/participant/add")
    public void addParticipantWS(@Valid @Payload ParticipantDTO payload) {
        if (payload.getUserId() == null || payload.getAddedByUserId() == null) {
            System.err.println("Error: userId or addedByUserId is missing in add participant payload");
            return;
        }
        Long addedByUserId = Long.parseLong(payload.getAddedByUserId());
        ConversationParticipant.ParticipantRole participantRole = ConversationParticipant.ParticipantRole.valueOf(payload.getRole().toUpperCase());
        ConversationParticipantDTO participant = conversationService.addParticipant(
                payload.getConversationId(),
                payload.getUserId(),
                addedByUserId,
                participantRole
        );
        messagingTemplate.convertAndSend("/topic/conversation/" + payload.getConversationId() + "/participant", participant);
        Optional<ConversationDTO> updatedConversation = conversationService.getConversationById(payload.getConversationId());
        if (updatedConversation.isPresent()) {
            messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "updated", "conversation", updatedConversation.get()));
        } else {
            System.err.println("Error: Conversation not found for ID " + payload.getConversationId());
        }
    }

    @MessageMapping("/conversation/participant/remove")
    public void removeParticipantWS(@Valid @Payload ParticipantDTO payload) {
        if (payload.getUserId() == null || payload.getRemovedByUserId() == null) {
            System.err.println("Error: userId or removedByUserId is missing in remove participant payload");
            return;
        }
        Long removedByUserId = Long.parseLong(payload.getRemovedByUserId());
        conversationService.removeParticipant(payload.getConversationId(), payload.getUserId(), removedByUserId);
        messagingTemplate.convertAndSend("/topic/conversation/" + payload.getConversationId() + "/participant",
                Map.of("userId", payload.getUserId(), "action", "removed"));
        Optional<ConversationDTO> updatedConversation = conversationService.getConversationById(payload.getConversationId());
        if (updatedConversation.isPresent()) {
            messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "updated", "conversation", updatedConversation.get()));
        } else {
            System.err.println("Error: Conversation not found for ID " + payload.getConversationId());
        }
    }

    @MessageMapping("/conversation/leave")
    public void leaveConversationWS(@Payload ConversationActionDTO actionDTO) {
        if (actionDTO.getUserId() == null) {
            System.err.println("Error: userId is missing in leave conversation payload");
            return;
        }
        Long userId = Long.parseLong(actionDTO.getUserId());
        conversationService.leaveConversation(actionDTO.getConversationId(), userId);
        messagingTemplate.convertAndSend("/topic/conversation/" + actionDTO.getConversationId() + "/participant",
                Map.of("userId", userId, "action", "removed"));
        Optional<ConversationDTO> updatedConversation = conversationService.getConversationById(actionDTO.getConversationId());
        if (updatedConversation.isPresent()) {
            messagingTemplate.convertAndSend("/user/queue/conversations", Map.of("action", "updated", "conversation", updatedConversation.get()));
        } else {
            System.err.println("Error: Conversation not found for ID " + actionDTO.getConversationId());
        }
    }

    // Global exception handler for IllegalArgumentException
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // Exception handler for authentication issues
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }
}