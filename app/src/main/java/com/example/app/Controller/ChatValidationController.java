package com.example.app.Controller;

import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ChatValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/validation")
public class ChatValidationController {

    @Autowired
    private ChatValidationService chatValidationService;

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

    @PostMapping("/message/content")
    public ResponseEntity<Boolean> validateMessageContent(@RequestBody String content) {
        return ResponseEntity.ok(chatValidationService.validateMessageContent(content));
    }

    @PostMapping("/message/type")
    public ResponseEntity<Boolean> validateMessageType(@RequestBody String messageType) {
        return ResponseEntity.ok(chatValidationService.validateMessageType(messageType));
    }

    @GetMapping("/message/can-send/{conversationId}")
    public ResponseEntity<Boolean> canUserSendMessage(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserSendMessage(conversationId, getCurrentUserId()));
    }

    @PostMapping("/message/length")
    public ResponseEntity<Boolean> isValidMessageLength(@RequestBody String content) {
        return ResponseEntity.ok(chatValidationService.isValidMessageLength(content));
    }

    @PostMapping("/file")
    public ResponseEntity<Boolean> validateFileUpload(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateFileUpload(file));
    }

    @PostMapping("/file/type")
    public ResponseEntity<Boolean> validateFileType(
            @RequestParam MultipartFile file,
            @RequestParam String expectedType
    ) {
        return ResponseEntity.ok(chatValidationService.validateFileType(file, expectedType));
    }

    @PostMapping("/file/size")
    public ResponseEntity<Boolean> validateFileSize(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateFileSize(file));
    }

    @PostMapping("/file/image")
    public ResponseEntity<Boolean> validateImageFile(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateImageFile(file));
    }

    @PostMapping("/file/video")
    public ResponseEntity<Boolean> validateVideoFile(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateVideoFile(file));
    }

    @PostMapping("/file/audio")
    public ResponseEntity<Boolean> validateAudioFile(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateAudioFile(file));
    }

    @PostMapping("/file/document")
    public ResponseEntity<Boolean> validateDocumentFile(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateDocumentFile(file));
    }

    @GetMapping("/conversation/access/{conversationId}")
    public ResponseEntity<Boolean> canUserAccessConversation(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserAccessConversation(conversationId, getCurrentUserId()));
    }

    @GetMapping("/conversation/modify/{conversationId}")
    public ResponseEntity<Boolean> canUserModifyConversation(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserModifyConversation(conversationId, getCurrentUserId()));
    }

    @GetMapping("/conversation/add-participants/{conversationId}")
    public ResponseEntity<Boolean> canUserAddParticipants(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserAddParticipants(conversationId, getCurrentUserId()));
    }

    @GetMapping("/conversation/remove-participants/{conversationId}")
    public ResponseEntity<Boolean> canUserRemoveParticipants(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserRemoveParticipants(conversationId, getCurrentUserId()));
    }

    @PostMapping("/conversation/name")
    public ResponseEntity<Boolean> validateConversationName(@RequestBody String name) {
        return ResponseEntity.ok(chatValidationService.validateConversationName(name));
    }

    @PostMapping("/conversation/description")
    public ResponseEntity<Boolean> validateGroupDescription(@RequestBody String description) {
        return ResponseEntity.ok(chatValidationService.validateGroupDescription(description));
    }

    @GetMapping("/call/initiate/{conversationId}")
    public ResponseEntity<Boolean> canUserInitiateCall(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatValidationService.canUserInitiateCall(conversationId, getCurrentUserId()));
    }

    @GetMapping("/call/join/{callId}")
    public ResponseEntity<Boolean> canUserJoinCall(@PathVariable Long callId) {
        return ResponseEntity.ok(chatValidationService.canUserJoinCall(callId, getCurrentUserId()));
    }

    @PostMapping("/call/type")
    public ResponseEntity<Boolean> isValidCallType(@RequestBody String callType) {
        return ResponseEntity.ok(chatValidationService.isValidCallType(callType));
    }

    @GetMapping("/call/participant/{callId}")
    public ResponseEntity<Boolean> isCallParticipant(@PathVariable Long callId) {
        return ResponseEntity.ok(chatValidationService.isCallParticipant(callId, getCurrentUserId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Boolean> isValidUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(chatValidationService.isValidUserId(userId));
    }

    @GetMapping("/users/same-conversation/{conversationId}/{userId1}/{userId2}")
    public ResponseEntity<Boolean> areUsersInSameConversation(
            @PathVariable Long conversationId,
            @PathVariable Long userId1,
            @PathVariable Long userId2
    ) {
        return ResponseEntity.ok(chatValidationService.areUsersInSameConversation(userId1, userId2, conversationId));
    }

    @GetMapping("/conversation/direct/{userId1}/{userId2}")
    public ResponseEntity<Boolean> canUsersStartDirectConversation(
            @PathVariable Long userId1,
            @PathVariable Long userId2
    ) {
        return ResponseEntity.ok(chatValidationService.canUsersStartDirectConversation(userId1, userId2));
    }

    @GetMapping("/message/rate-limit")
    public ResponseEntity<Boolean> checkMessageRateLimit() {
        return ResponseEntity.ok(chatValidationService.checkMessageRateLimit(getCurrentUserId()));
    }

    @GetMapping("/file/rate-limit")
    public ResponseEntity<Boolean> checkFileUploadRateLimit() {
        return ResponseEntity.ok(chatValidationService.checkFileUploadRateLimit(getCurrentUserId()));
    }

    @GetMapping("/call/rate-limit")
    public ResponseEntity<Boolean> checkCallInitiationRateLimit() {
        return ResponseEntity.ok(chatValidationService.checkCallInitiationRateLimit(getCurrentUserId()));
    }

    @PostMapping("/message/spam")
    public ResponseEntity<Boolean> validateMessageForSpam(@RequestBody String content) {
        return ResponseEntity.ok(chatValidationService.validateMessageForSpam(content));
    }

    @PostMapping("/file/malware")
    public ResponseEntity<Boolean> validateFileForMalware(@RequestParam MultipartFile file) {
        return ResponseEntity.ok(chatValidationService.validateFileForMalware(file));
    }

    @PostMapping("/image/content")
    public ResponseEntity<Boolean> validateImageContent(@RequestParam MultipartFile image) {
        return ResponseEntity.ok(chatValidationService.validateImageContent(image));
    }

    @GetMapping("/permission/{permission}/{resourceId}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable String permission,
            @PathVariable Long resourceId
    ) {
        return ResponseEntity.ok(chatValidationService.hasPermission(getCurrentUserId(), permission, resourceId));
    }

    @GetMapping("/action/{action}/{conversationId}")
    public ResponseEntity<Boolean> canPerformAction(
            @PathVariable String action,
            @PathVariable Long conversationId
    ) {
        return ResponseEntity.ok(chatValidationService.canPerformAction(getCurrentUserId(), action, conversationId));
    }
}