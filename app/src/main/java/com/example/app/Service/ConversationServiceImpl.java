package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import com.example.app.Repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class ConversationServiceImpl implements ConversationService {

    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private ConversationParticipantRepository participantRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ChatValidationService validationService;

    @Override
    public ConversationDTO createConversation(CreateConversationDTO createDTO, Long creatorId) {
        validationService.validateConversationName(createDTO.getName());
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Conversation conversation = modelMapper.map(createDTO, Conversation.class);
        conversation.setCreatedBy(creator);
        conversation.setCreatedDate(LocalDateTime.now());
        conversation.setUpdatedDate(LocalDateTime.now());
        conversation = conversationRepository.save(conversation);

        // Add creator as admin
        addParticipant(conversation.getId(), creatorId, creatorId, ConversationParticipant.ParticipantRole.ADMIN);

        // Add other participants
        if (createDTO.getParticipantIds() != null) {
            addMultipleParticipants(conversation.getId(), createDTO.getParticipantIds(), creatorId);
        }

        return modelMapper.map(conversation, ConversationDTO.class);
    }

    @Override
    public ConversationDTO createDirectConversation(Long userId1, Long userId2) {
        Optional<Conversation> existing = conversationRepository.findDirectConversationBetweenUsers(userId1, userId2);
        if (existing.isPresent()) {
            return modelMapper.map(existing.get(), ConversationDTO.class);
        }

        CreateConversationDTO createDTO = new CreateConversationDTO();
        createDTO.setGroup(false);
        createDTO.setName("Direct Chat");
        createDTO.setParticipantIds(List.of(userId2));
        return createConversation(createDTO, userId1);
    }

    @Override
    public ConversationDTO createGroupConversation(String name, String description, List<Long> participantIds, Long creatorId) {
        CreateConversationDTO createDTO = new CreateConversationDTO();
        createDTO.setName(name);
        createDTO.setGroupDescription(description);
        createDTO.setGroup(true);
        createDTO.setParticipantIds(participantIds);
        return createConversation(createDTO, creatorId);
    }

    @Override
    public Optional<ConversationDTO> getConversationById(Long conversationId) {
        return conversationRepository.findById(conversationId)
                .map(conv -> modelMapper.map(conv, ConversationDTO.class));
    }

    @Override
    public List<ConversationDTO> getUserConversations(Long userId) {
        return conversationRepository.findByUserIdOrderByUpdatedDateDesc(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .map(conv -> modelMapper.map(conv, ConversationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public Page<ConversationDTO> getUserConversationsPaginated(Long userId, Pageable pageable) {
        return conversationRepository.findByUserIdOrderByUpdatedDateDesc(userId, pageable)
                .map(conv -> modelMapper.map(conv, ConversationDTO.class));
    }

    @Override
    public ConversationDTO updateConversation(Long conversationId, ConversationDTO conversationDTO, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        validationService.canUserModifyConversation(conversationId, userId);

        conversation.setName(conversationDTO.getName());
        conversation.setGroupDescription(conversationDTO.getGroupDescription());
        conversation.setTheme(conversationDTO.getTheme());
        conversation.setArchived(conversationDTO.getArchived());
        conversation.setPinned(conversationDTO.getPinned());
        conversation = conversationRepository.save(conversation);

        return modelMapper.map(conversation, ConversationDTO.class);
    }

    @Override
    public void deleteConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        validationService.canUserModifyConversation(conversationId, userId);
        conversationRepository.delete(conversation);
    }

    @Override
    public ConversationParticipantDTO addParticipant(Long conversationId, Long userId, Long addedByUserId, ConversationParticipant.ParticipantRole role) {
        validationService.canUserAddParticipants(conversationId, addedByUserId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ConversationParticipant participant = new ConversationParticipant();
        participant.setConversation(conversation);
        participant.setUser(user);
        participant.setRole(role);
        participant.setJoinedDate(LocalDateTime.now());
        participant.setActive(true);
        participant = participantRepository.save(participant);

        return modelMapper.map(participant, ConversationParticipantDTO.class);
    }

    @Override
    public List<ConversationParticipantDTO> addMultipleParticipants(Long conversationId, List<Long> userIds, Long addedByUserId) {
        return userIds.stream()
                .map(userId -> addParticipant(conversationId, userId, addedByUserId, ConversationParticipant.ParticipantRole.MEMBER))
                .collect(Collectors.toList());
    }

    @Override
    public void removeParticipant(Long conversationId, Long userId, Long removedByUserId) {
        validationService.canUserRemoveParticipants(conversationId, removedByUserId);
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        participant.setActive(false);
        participant.setLeftDate(LocalDateTime.now());
        participantRepository.save(participant);
    }

    @Override
    public void leaveConversation(Long conversationId, Long userId) {
        removeParticipant(conversationId, userId, userId);
    }

    @Override
    public ConversationParticipantDTO updateParticipantRole(Long conversationId, Long userId, ConversationParticipant.ParticipantRole role, Long updatedByUserId) {
        validationService.canUserModifyConversation(conversationId, updatedByUserId);
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        participant.setRole(role);
        participant = participantRepository.save(participant);
        return modelMapper.map(participant, ConversationParticipantDTO.class);
    }

    @Override
    public List<ConversationParticipantDTO> getConversationParticipants(Long conversationId) {
        return participantRepository.findActiveParticipantsByConversationId(conversationId)
                .stream()
                .map(part -> modelMapper.map(part, ConversationParticipantDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public boolean isUserParticipant(Long conversationId, Long userId) {
        return participantRepository.findByConversationIdAndUserId(conversationId, userId).isPresent();
    }

    @Override
    public boolean isUserAdmin(Long conversationId, Long userId) {
        return participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .map(part -> part.getRole() == ConversationParticipant.ParticipantRole.ADMIN)
                .orElse(false);
    }

    @Override
    public List<ConversationDTO> searchConversations(Long userId, String query) {
        return conversationRepository.searchGroupConversations(query)
                .stream()
                .filter(conv -> isUserParticipant(conv.getId(), userId))
                .map(conv -> modelMapper.map(conv, ConversationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationDTO> getActiveConversations(Long userId) {
        return getUserConversations(userId).stream()
                .filter(conv -> !conv.getArchived())
                .collect(Collectors.toList());
    }

    @Override
    public List<ConversationDTO> getArchivedConversations(Long userId) {
        return conversationRepository.findArchivedConversationsByUserId(userId)
                .stream()
                .map(conv -> modelMapper.map(conv, ConversationDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public ConversationDTO updateGroupDetails(Long conversationId, String name, String description, String groupImage, Long userId) {
        validationService.canUserModifyConversation(conversationId, userId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        conversation.setName(name);
        conversation.setGroupDescription(description);
        conversation.setGroupImage(groupImage);
        conversation = conversationRepository.save(conversation);
        return modelMapper.map(conversation, ConversationDTO.class);
    }

    @Override
    public ConversationDTO updateGroupImage(Long conversationId, String imagePath, Long userId) {
        validationService.canUserModifyConversation(conversationId, userId);
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));
        conversation.setGroupImage(imagePath);
        conversation = conversationRepository.save(conversation);
        return modelMapper.map(conversation, ConversationDTO.class);
    }

    @Override
    public void updateNotificationSettings(Long conversationId, Long userId, boolean enabled) {
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        participant.setNotificationsEnabled(enabled);
        participantRepository.save(participant);
    }

    @Override
    public void updateLastSeen(Long conversationId, Long userId) {
        ConversationParticipant participant = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found"));
        participant.setLastSeen(LocalDateTime.now());
        participantRepository.save(participant);
    }

    @Override
    public List<String> getOnlineParticipants(Long conversationId) {
        return participantRepository.findActiveParticipantsByConversationId(conversationId)
                .stream()
                .filter(part -> part.getLastSeen() != null && part.getLastSeen().isAfter(LocalDateTime.now().minusMinutes(5)))
                .map(part -> part.getUser().getUsername())
                .collect(Collectors.toList());
    }
    @Override
    public Optional<ConversationDTO> getExistingDirectConversation(Long userId1, Long userId2) {
        return conversationRepository.findDirectConversationBetweenUsers(userId1, userId2)
                .map(conv -> modelMapper.map(conv, ConversationDTO.class));
    }

    @Override
    public ConversationDTO getOrCreateDirectConversation(Long userId1, Long userId2) {
        // First try to get existing conversation
        Optional<Conversation> existing = conversationRepository.findDirectConversationBetweenUsers(userId1, userId2);
        if (existing.isPresent()) {
            return modelMapper.map(existing.get(), ConversationDTO.class);
        }

        // If not found, create a new one
        return createDirectConversation(userId1, userId2);
    }
}