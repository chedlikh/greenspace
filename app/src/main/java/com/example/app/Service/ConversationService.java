package com.example.app.Service;

import com.example.app.DTOs.ConversationDTO;
import com.example.app.DTOs.ConversationParticipantDTO;
import com.example.app.DTOs.CreateConversationDTO;
import com.example.app.Entities.ConversationParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ConversationService {
    ConversationDTO createConversation(CreateConversationDTO createDTO, Long creatorId);
    ConversationDTO createDirectConversation(Long userId1, Long userId2);
    ConversationDTO createGroupConversation(String name, String description, List<Long> participantIds, Long creatorId);
    Optional<ConversationDTO> getConversationById(Long conversationId);
    List<ConversationDTO> getUserConversations(Long userId);
    Page<ConversationDTO> getUserConversationsPaginated(Long userId, Pageable pageable);
    ConversationDTO updateConversation(Long conversationId, ConversationDTO conversationDTO, Long userId);
    void deleteConversation(Long conversationId, Long userId);
    ConversationParticipantDTO addParticipant(Long conversationId, Long userId, Long addedByUserId, ConversationParticipant.ParticipantRole role);
    List<ConversationParticipantDTO> addMultipleParticipants(Long conversationId, List<Long> userIds, Long addedByUserId);
    void removeParticipant(Long conversationId, Long userId, Long removedByUserId);
    void leaveConversation(Long conversationId, Long userId);
    ConversationParticipantDTO updateParticipantRole(Long conversationId, Long userId, ConversationParticipant.ParticipantRole role, Long updatedByUserId);
    List<ConversationParticipantDTO> getConversationParticipants(Long conversationId);
    boolean isUserParticipant(Long conversationId, Long userId);
    boolean isUserAdmin(Long conversationId, Long userId);
    List<ConversationDTO> searchConversations(Long userId, String query);
    List<ConversationDTO> getActiveConversations(Long userId);
    List<ConversationDTO> getArchivedConversations(Long userId);
    ConversationDTO updateGroupDetails(Long conversationId, String name, String description, String groupImage, Long userId);
    ConversationDTO updateGroupImage(Long conversationId, String imagePath, Long userId);
    void updateNotificationSettings(Long conversationId, Long userId, boolean enabled);
    void updateLastSeen(Long conversationId, Long userId);
    List<String> getOnlineParticipants(Long conversationId);
    Optional<ConversationDTO> getExistingDirectConversation(Long userId1, Long userId2);
    ConversationDTO getOrCreateDirectConversation(Long userId1, Long userId2);
}
