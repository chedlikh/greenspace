package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Message;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.SearchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private SearchService searchService;

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

    @GetMapping("/messages")
    public ResponseEntity<Page<MessageDTO>> searchMessages(
            @RequestParam String query,
            Pageable pageable
    ) {
        return ResponseEntity.ok(searchService.searchMessages(query, getCurrentUserId(), pageable));
    }

    @GetMapping("/messages/conversation/{conversationId}")
    public ResponseEntity<Page<MessageDTO>> searchMessagesInConversation(
            @PathVariable Long conversationId,
            @RequestParam String query,
            Pageable pageable
    ) {
        return ResponseEntity.ok(searchService.searchMessagesInConversation(conversationId, query, pageable));
    }

    @GetMapping("/messages/type")
    public ResponseEntity<List<MessageDTO>> searchMessagesByType(@RequestParam Message.MessageType messageType) {
        return ResponseEntity.ok(searchService.searchMessagesByType(messageType, getCurrentUserId()));
    }

    @PostMapping("/messages/advanced")
    public ResponseEntity<Page<MessageDTO>> advancedMessageSearch(@RequestBody MessageSearchDTO searchDTO) {
        return ResponseEntity.ok(searchService.advancedMessageSearch(searchDTO));
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationDTO>> searchConversations(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchConversations(query, getCurrentUserId()));
    }

    @GetMapping("/conversations/group")
    public ResponseEntity<List<ConversationDTO>> searchGroupConversations(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchGroupConversations(query, getCurrentUserId()));
    }

    @GetMapping("/conversations/direct")
    public ResponseEntity<List<ConversationDTO>> searchDirectConversations(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchDirectConversations(query, getCurrentUserId()));
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchUsers(query));
    }

    @GetMapping("/users/conversation/{conversationId}")
    public ResponseEntity<List<UserDTO>> searchUsersInConversation(
            @PathVariable Long conversationId,
            @RequestParam String query
    ) {
        return ResponseEntity.ok(searchService.searchUsersInConversation(conversationId, query));
    }

    @GetMapping("/users/available")
    public ResponseEntity<List<UserDTO>> searchAvailableUsers(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchAvailableUsers(query, getCurrentUserId()));
    }

    @GetMapping("/files")
    public ResponseEntity<List<MessageAttachmentDTO>> searchFiles(@RequestParam String query) {
        return ResponseEntity.ok(searchService.searchFiles(query, getCurrentUserId()));
    }

    @GetMapping("/files/type")
    public ResponseEntity<List<MessageAttachmentDTO>> searchFilesByType(@RequestParam String fileType) {
        return ResponseEntity.ok(searchService.searchFilesByType(fileType, getCurrentUserId()));
    }

    @GetMapping("/files/conversation/{conversationId}")
    public ResponseEntity<List<MessageAttachmentDTO>> searchFilesInConversation(
            @PathVariable Long conversationId,
            @RequestParam String query
    ) {
        return ResponseEntity.ok(searchService.searchFilesInConversation(conversationId, query));
    }

    @GetMapping("/global")
    public ResponseEntity<Map<String, Object>> globalSearch(@RequestParam String query) {
        return ResponseEntity.ok(searchService.globalSearch(query, getCurrentUserId()));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<Object>> getSearchSuggestions(@RequestParam String query) {
        return ResponseEntity.ok(searchService.getSearchSuggestions(query, getCurrentUserId()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<String>> getUserSearchHistory() {
        return ResponseEntity.ok(searchService.getUserSearchHistory(getCurrentUserId()));
    }

    @DeleteMapping("/history")
    public ResponseEntity<Void> clearSearchHistory() {
        searchService.clearSearchHistory(getCurrentUserId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/filters")
    public ResponseEntity<List<String>> getSearchFilters() {
        return ResponseEntity.ok(searchService.getSearchFilters());
    }

    @GetMapping("/autocomplete/messages")
    public ResponseEntity<List<String>> getAutoCompleteMessages(
            @RequestParam String prefix,
            @RequestParam Long conversationId
    ) {
        return ResponseEntity.ok(searchService.getAutoCompleteMessages(prefix, conversationId));
    }

    @GetMapping("/autocomplete/users")
    public ResponseEntity<List<String>> getAutoCompleteUsers(@RequestParam String prefix) {
        return ResponseEntity.ok(searchService.getAutoCompleteUsers(prefix));
    }

    @GetMapping("/autocomplete/conversations")
    public ResponseEntity<List<String>> getAutoCompleteConversations(@RequestParam String prefix) {
        return ResponseEntity.ok(searchService.getAutoCompleteConversations(prefix, getCurrentUserId()));
    }
}