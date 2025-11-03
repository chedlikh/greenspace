package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface SearchService {
    Page<MessageDTO> searchMessages(String query, Long userId, Pageable pageable);

    Page<MessageDTO> searchMessagesInConversation(Long conversationId, String query, Pageable pageable);



    List<MessageDTO> searchMessagesByType(Message.MessageType messageType, Long userId);

    Page<MessageDTO> advancedMessageSearch(MessageSearchDTO searchDTO);

    List<ConversationDTO> searchConversations(String query, Long userId);

    List<ConversationDTO> searchGroupConversations(String query, Long userId);

    List<ConversationDTO> searchDirectConversations(String query, Long userId);

    List<UserDTO> searchUsers(String query);

    List<UserDTO> searchUsersInConversation(Long conversationId, String query);

    List<UserDTO> searchAvailableUsers(String query, Long currentUserId);

    List<MessageAttachmentDTO> searchFiles(String query, Long userId);

    List<MessageAttachmentDTO> searchFilesByType(String fileType, Long userId);

    List<MessageAttachmentDTO> searchFilesInConversation(Long conversationId, String query);

    Map<String, Object> globalSearch(String query, Long userId);

    List<Object> getSearchSuggestions(String query, Long userId);

    void saveSearchQuery(String query, Long userId);

    List<String> getUserSearchHistory(Long userId);

    void clearSearchHistory(Long userId);

    Page<MessageDTO> searchWithFilters(String query, Map<String, Object> filters, Long userId, Pageable pageable);

    List<String> getSearchFilters();

    List<String> getAutoCompleteMessages(String prefix, Long conversationId);

    List<String> getAutoCompleteUsers(String prefix);

    List<String> getAutoCompleteConversations(String prefix, Long userId);
}
