package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.Conversation;
import com.example.app.Entities.Message;
import com.example.app.Entities.SearchHistory;
import com.example.app.Entities.User;
import com.example.app.Repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class SearchServiceImpl implements SearchService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private MessageAttachmentRepository attachmentRepository;
    @Autowired
    private SearchHistoryRepository searchHistoryRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ConversationService conversationService;
    @Autowired
    private ConversationParticipantRepository participantRepository;

    @Override
    public Page<MessageDTO> searchMessages(String query, Long userId, Pageable pageable) {
        saveSearchQuery(query, userId);
        return messageRepository.searchMessagesInConversation(null, query, pageable)
                .map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public Page<MessageDTO> searchMessagesInConversation(Long conversationId, String query, Pageable pageable) {
        saveSearchQuery(query, null);
        return messageRepository.searchMessagesInConversation(conversationId, query, pageable)
                .map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public List<MessageDTO> searchMessagesByType(Message.MessageType messageType, Long userId) {
        return messageRepository.findMessagesByType(null, messageType, null)
                .stream()
                .map(msg -> modelMapper.map(msg, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<MessageDTO> advancedMessageSearch(MessageSearchDTO searchDTO) {
        saveSearchQuery(searchDTO.getQuery(), searchDTO.getSenderId());
        return messageRepository.searchMessagesInConversation(
                searchDTO.getConversationId(),
                searchDTO.getQuery(),
                Pageable.ofSize(searchDTO.getSize()).withPage(searchDTO.getPage())
        ).map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public List<ConversationDTO> searchConversations(String query, Long userId) {
        saveSearchQuery(query, userId);
        return conversationRepository.searchGroupConversations(query)
                .stream()
                .filter(conv -> conversationService.isUserParticipant(conv.getId(), userId))
                .map(conv -> modelMapper.map(conv, ConversationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationDTO> searchGroupConversations(String query, Long userId) {
        return searchConversations(query, userId).stream()
                .filter(ConversationDTO::getGroup)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationDTO> searchDirectConversations(String query, Long userId) {
        return searchConversations(query, userId).stream()
                .filter(conv -> !conv.getGroup())
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchUsers(String query) {
        return userRepository.findByUsernameContainingIgnoreCase(query)
                .stream()
                .map(user -> modelMapper.map(user, UserDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchUsersInConversation(Long conversationId, String query) {
        return participantRepository.findActiveParticipantsByConversationId(conversationId)
                .stream()
                .filter(part -> part.getUser().getUsername().toLowerCase().contains(query.toLowerCase()))
                .map(part -> modelMapper.map(part.getUser(), UserDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> searchAvailableUsers(String query, Long currentUserId) {
        return searchUsers(query).stream()
                .filter(user -> !user.getId().equals(currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageAttachmentDTO> searchFiles(String query, Long userId) {
        return attachmentRepository.findByFileNameContainingIgnoreCase(query)
                .stream()
                .filter(att -> conversationService.isUserParticipant(att.getMessage().getConversation().getId(), userId))
                .map(att -> modelMapper.map(att, MessageAttachmentDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageAttachmentDTO> searchFilesByType(String fileType, Long userId) {
        return attachmentRepository.findByConversationIdAndType(null, fileType)
                .stream()
                .filter(att -> conversationService.isUserParticipant(att.getMessage().getConversation().getId(), userId))
                .map(att -> modelMapper.map(att, MessageAttachmentDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageAttachmentDTO> searchFilesInConversation(Long conversationId, String query) {
        return attachmentRepository.findByFileNameContainingIgnoreCase(query)
                .stream()
                .filter(att -> att.getMessage().getConversation().getId().equals(conversationId))
                .map(att -> modelMapper.map(att, MessageAttachmentDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> globalSearch(String query, Long userId) {
        saveSearchQuery(query, userId);
        Map<String, Object> results = new HashMap<>();
        results.put("messages", searchMessages(query, userId, Pageable.ofSize(10)).getContent());
        results.put("conversations", searchConversations(query, userId));
        results.put("users", searchUsers(query));
        results.put("files", searchFiles(query, userId));
        return results;
    }

    @Override
    public List<Object> getSearchSuggestions(String query, Long userId) {
        return List.of(
                searchMessages(query, userId, Pageable.ofSize(3)).getContent(),
                searchConversations(query, userId).subList(0, Math.min(3, searchConversations(query, userId).size())),
                searchUsers(query).subList(0, Math.min(3, searchUsers(query).size()))
        );
    }

    @Override
    public void saveSearchQuery(String query, Long userId) {
        if (userId != null) {
            SearchHistory history = new SearchHistory();
            history.setUser(userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found")));
            history.setQuery(query);
            history.setSearchDate(LocalDateTime.now());
            searchHistoryRepository.save(history);
        }
    }

    @Override
    public List<String> getUserSearchHistory(Long userId) {
        return searchHistoryRepository.findByUserId(userId)
                .stream()
                .map(SearchHistory::getQuery)
                .collect(Collectors.toList());
    }

    @Override
    public void clearSearchHistory(Long userId) {
        searchHistoryRepository.deleteByUserId(userId);
    }

    @Override
    public Page<MessageDTO> searchWithFilters(String query, Map<String, Object> filters, Long userId, Pageable pageable) {
        // Placeholder: Implement filter-based search
        return searchMessages(query, userId, pageable);
    }

    @Override
    public List<String> getSearchFilters() {
        return List.of("messageType", "senderId", "dateRange");
    }

    @Override
    public List<String> getAutoCompleteMessages(String prefix, Long conversationId) {
        return messageRepository.searchMessagesInConversation(conversationId, prefix, Pageable.ofSize(5))
                .getContent()
                .stream()
                .map(Message::getContent)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAutoCompleteUsers(String prefix) {
        return userRepository.findByUsernameContainingIgnoreCase(prefix)
                .stream()
                .map(User::getUsername)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAutoCompleteConversations(String prefix, Long userId) {
        return conversationRepository.searchGroupConversations(prefix)
                .stream()
                .filter(conv -> conversationService.isUserParticipant(conv.getId(), userId))
                .map(Conversation::getName)
                .collect(Collectors.toList());
    }
}