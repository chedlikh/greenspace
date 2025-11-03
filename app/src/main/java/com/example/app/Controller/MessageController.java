package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Message;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private UserRepo userRepository;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @PostMapping
    public ResponseEntity<MessageDTO> sendMessage(@RequestBody SendMessageDTO sendDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.sendMessage(sendDTO, getCurrentUserId()));
    }

    @PostMapping("/text/{conversationId}")
    public ResponseEntity<MessageDTO> sendTextMessage(
            @PathVariable Long conversationId,
            @RequestBody String content) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.sendTextMessage(conversationId, content, getCurrentUserId()));
    }

    @PostMapping("/media/{conversationId}")
    public ResponseEntity<MessageDTO> sendMediaMessage(
            @PathVariable Long conversationId,
            @RequestParam MultipartFile file,
            @RequestParam String type) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.sendMediaMessage(conversationId, file, Message.MessageType.valueOf(type), getCurrentUserId()));
    }

    @PostMapping("/voice/{conversationId}")
    public ResponseEntity<MessageDTO> sendVoiceMessage(
            @PathVariable Long conversationId,
            @RequestParam MultipartFile voiceFile) throws IOException {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.sendVoiceMessage(conversationId, voiceFile, getCurrentUserId()));
    }

    @PostMapping("/location/{conversationId}")
    public ResponseEntity<MessageDTO> sendLocationMessage(
            @PathVariable Long conversationId,
            @RequestBody String location) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.sendLocationMessage(conversationId, location, getCurrentUserId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDTO> getMessageById(@PathVariable Long id) {
        return messageService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<Page<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            Pageable pageable) {
        return ResponseEntity.ok(messageService.getConversationMessages(conversationId, pageable));
    }

    @GetMapping("/recent/{conversationId}")
    public ResponseEntity<List<MessageDTO>> getRecentMessages(
            @PathVariable Long conversationId,
            @RequestParam int limit) {
        return ResponseEntity.ok(messageService.getRecentMessages(conversationId, limit));
    }

    @PutMapping("/{id}/delivered")
    public ResponseEntity<Void> markMessageAsDelivered(@PathVariable Long id) {
        messageService.markMessageAsDelivered(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markMessageAsRead(@PathVariable Long id) {
        messageService.markMessageAsRead(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationMessagesAsRead(@PathVariable Long conversationId) {
        messageService.markConversationMessagesAsRead(conversationId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/unread")
    public ResponseEntity<List<MessageDTO>> getUnreadMessages() {
        return ResponseEntity.ok(messageService.getUnreadMessages(getCurrentUserId()));
    }

    @GetMapping("/unread/count/{conversationId}")
    public ResponseEntity<Integer> getUnreadMessagesCount(@PathVariable Long conversationId) {
        return ResponseEntity.ok(messageService.getUnreadMessagesCount(conversationId, getCurrentUserId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MessageDTO> editMessage(
            @PathVariable Long id,
            @RequestBody String newContent) {
        return ResponseEntity.ok(messageService.editMessage(id, newContent, getCurrentUserId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/everyone")
    public ResponseEntity<Void> deleteMessageForEveryone(@PathVariable Long id) {
        messageService.deleteMessageForEveryone(id, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reply/{originalMessageId}")
    public ResponseEntity<MessageDTO> replyToMessage(
            @PathVariable Long originalMessageId,
            @RequestBody String content) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.replyToMessage(originalMessageId, content, getCurrentUserId()));
    }

    @GetMapping("/{id}/replies")
    public ResponseEntity<List<MessageDTO>> getMessageReplies(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessageReplies(id));
    }

    @PostMapping("/forward")
    public ResponseEntity<List<MessageDTO>> forwardMessages(
            @RequestBody List<Long> messageIds,
            @RequestParam Long targetConversationId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.forwardMessages(messageIds, targetConversationId, getCurrentUserId()));
    }

    @PostMapping("/search")
    public ResponseEntity<Page<MessageDTO>> searchMessages(@RequestBody MessageSearchDTO searchDTO) {
        return ResponseEntity.ok(messageService.searchMessages(searchDTO));
    }

    @GetMapping("/search/conversation/{conversationId}")
    public ResponseEntity<List<MessageDTO>> searchMessagesInConversation(
            @PathVariable Long conversationId,
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(messageService.searchMessagesInConversation(conversationId, query, pageable));
    }

    @PostMapping("/{id}/attachments")
    public ResponseEntity<MessageAttachmentDTO> uploadAttachment(
            @PathVariable Long id,
            @RequestParam MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(messageService.uploadAttachment(file, id));
    }

    @GetMapping("/{id}/attachments")
    public ResponseEntity<List<MessageAttachmentDTO>> getMessageAttachments(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessageAttachments(id));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long attachmentId) {
        messageService.deleteAttachment(attachmentId, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reactions")
    public ResponseEntity<MessageReactionDTO> addReaction(
            @PathVariable Long id,
            @RequestBody String emoji) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.addReaction(id, emoji, getCurrentUserId()));
    }

    @DeleteMapping("/{id}/reactions")
    public ResponseEntity<Void> deleteReaction(
            @PathVariable Long id,
            @RequestParam String emoji) {
        messageService.removeReaction(id, emoji, getCurrentUserId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/reactions")
    public ResponseEntity<List<MessageReactionDTO>> getMessageReactions(@PathVariable Long id) {
        return ResponseEntity.ok(messageService.getMessageReactions(id));
    }

    @PostMapping("/system/{conversationId}")
    public ResponseEntity<MessageDTO> sendSystemMessage(
            @PathVariable Long conversationId,
            @RequestBody String content) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                messageService.sendSystemMessage(conversationId, content));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }
}