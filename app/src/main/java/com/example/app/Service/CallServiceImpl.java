package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import com.example.app.Mappers.CallMapper;
import com.example.app.Mappers.CallParticipantMapper;
import com.example.app.Repository.*;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class CallServiceImpl implements CallService {

    @Autowired
    private CallRepository callRepository;
    @Autowired
    private CallParticipantRepository callParticipantRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ChatValidationService validationService;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private ConversationService conversationService;
    @Autowired
    private CallPreferencesRepository callPreferencesRepository;
    @Autowired
    private NotificationServices notificationService;
    @Autowired
    private CallMapper callMapper;
    @Autowired
    private CallParticipantMapper callParticipantMapper;

    private static final Logger logger = LoggerFactory.getLogger(CallServiceImpl.class);

    @Override
    public CallDTO initiateCall(CallCreateDTO callCreateDTO) {
        if (callCreateDTO == null || callCreateDTO.getConversationId() == null || callCreateDTO.getInitiatedById() == null) {
            logger.error("Invalid call creation parameters: {}", callCreateDTO);
            throw new IllegalArgumentException("Invalid call creation parameters");
        }
        Conversation conversation = conversationRepository.findById(callCreateDTO.getConversationId())
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found: " + callCreateDTO.getConversationId()));
        User initiator = userRepository.findById(callCreateDTO.getInitiatedById())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + callCreateDTO.getInitiatedById()));

        Call call = callMapper.toEntity(callCreateDTO, conversation, initiator);
        call = callRepository.save(call);

        CallParticipant initiatorParticipant = addParticipantToCall(call.getId(), initiator.getId());

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO: callId={}", call.getId());
            throw new IllegalStateException("Call mapping failed");
        }

        // Notify all conversation participants except initiator
        conversation.getParticipants().stream()
                .map(ConversationParticipant::getUser)
                .filter(user -> user != null && !user.getId().equals(initiator.getId()))
                .forEach(user -> {
                    webSocketService.sendCallInvitation(user.getId(), callDTO);
                    notificationService.sendCallNotification(user.getId(), callDTO);
                });

        return callDTO;
    }

    @Override
    public CallDTO initiateDirectCall(Long targetUserId, Call.CallType type, Long initiatorId) {
        if (targetUserId == null || type == null || initiatorId == null) {
            logger.error("Invalid parameters for direct call: targetUserId={}, type={}, initiatorId={}",
                    targetUserId, type, initiatorId);
            throw new IllegalArgumentException("Invalid call parameters");
        }

        User initiator = userRepository.findById(initiatorId)
                .orElseThrow(() -> new IllegalArgumentException("Initiator not found: " + initiatorId));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Target user not found: " + targetUserId));

        Conversation conversation = conversationRepository.findDirectConversationBetweenUsers(initiatorId, targetUserId)
                .orElseGet(() -> {
                    Conversation newConv = new Conversation();
                    newConv.setGroup(false);
                    newConv.setCreatedBy(initiator);
                    newConv.setCreatedDate(LocalDateTime.now());
                    Conversation savedConv = conversationRepository.save(newConv);
                    ConversationParticipant initiatorPart = new ConversationParticipant();
                    initiatorPart.setConversation(savedConv);
                    initiatorPart.setUser(initiator);
                    initiatorPart.setJoinedDate(LocalDateTime.now());
                    ConversationParticipant targetPart = new ConversationParticipant();
                    targetPart.setConversation(savedConv);
                    targetPart.setUser(target);
                    targetPart.setJoinedDate(LocalDateTime.now());
                    savedConv.getParticipants().add(initiatorPart);
                    savedConv.getParticipants().add(targetPart);
                    return conversationRepository.save(savedConv);
                });

        if (conversation.getId() == null) {
            logger.error("Failed to create or retrieve conversation for users {} and {}", initiatorId, targetUserId);
            throw new IllegalStateException("Conversation creation failed");
        }

        Call call = new Call();
        call.setConversation(conversation);
        call.setInitiatedBy(initiator);
        call.setType(type);
        call.setStatus(Call.CallStatus.RINGING);
        call.setStartedDate(LocalDateTime.now());
        call = callRepository.save(call);

        CallParticipant initiatorParticipant = new CallParticipant();
        initiatorParticipant.setCall(call);
        initiatorParticipant.setUser(initiator);
        initiatorParticipant.setStatus(CallParticipant.ParticipantStatus.JOINED);
        initiatorParticipant.setAudioEnabled(true);
        initiatorParticipant.setVideoEnabled(type == Call.CallType.VIDEO);
        call.getParticipants().add(initiatorParticipant);

        CallParticipant targetParticipant = new CallParticipant();
        targetParticipant.setCall(call);
        targetParticipant.setUser(target);
        targetParticipant.setStatus(CallParticipant.ParticipantStatus.INVITED);
        targetParticipant.setAudioEnabled(true);
        targetParticipant.setVideoEnabled(type == Call.CallType.VIDEO);
        call.getParticipants().add(targetParticipant);

        call = callRepository.save(call);

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null || callDTO.getInitiatedBy() == null) {
            logger.warn("Incomplete CallDTO mapping for callId={}", call.getId());
            callDTO = new CallDTO();
            callDTO.setId(call.getId());
            callDTO.setType(call.getType());
            callDTO.setStatus(call.getStatus());
            callDTO.setStartedDate(call.getStartedDate());
            callDTO.setConversationId(conversation.getId());
            UserDTO initiatorDTO = new UserDTO();
            initiatorDTO.setId(initiator.getId());
            initiatorDTO.setUsername(initiator.getUsername() != null ? initiator.getUsername() : "Anonymous");
            initiatorDTO.setFirstname(initiator.getFirstname());
            initiatorDTO.setLastName(initiator.getLastName());
            initiatorDTO.setPhotoProfile(initiator.getPhotoProfile());
            callDTO.setInitiatedBy(initiatorDTO);
        }

        notificationService.sendCallNotification(targetUserId, callDTO);


        return callDTO;
    }

    @Override
    public CallPreferencesDTO getCallPreferences(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        CallPreferences preferences = callPreferencesRepository.findByUserId(userId)
                .orElseGet(() -> {
                    CallPreferences defaultPrefs = new CallPreferences(userId, true, false);
                    return callPreferencesRepository.save(defaultPrefs);
                });

        try {
            return modelMapper.map(preferences, CallPreferencesDTO.class);
        } catch (Exception e) {
            logger.error("Failed to map CallPreferences to CallPreferencesDTO: {}", e.getMessage());
            throw new RuntimeException("Failed to map preferences", e);
        }
    }

    @Override
    public CallDTO initiateGroupCall(CallCreateDTO callCreateDTO) {
        return initiateCall(callCreateDTO);
    }

    @Override
    public Optional<CallDTO> getCallById(Long callId) {
        return callRepository.findByIdWithParticipants(callId)
                .map(callMapper::toDto);
    }

    @Override
    public CallDTO joinCall(Long callId, Long userId) {
        validationService.canUserJoinCall(callId, userId);
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));

        Optional<CallParticipant> existingParticipant = callParticipantRepository.findByCallIdAndUserId(callId, userId);
        CallParticipant participant;
        if (existingParticipant.isPresent()) {
            participant = existingParticipant.get();
            if (participant.getStatus() == CallParticipant.ParticipantStatus.JOINED) {
                logger.warn("User {} already joined call {}", userId, callId);
                throw new IllegalStateException("User already joined the call");
            }
        } else {
            participant = new CallParticipant();
            participant.setCall(call);
            participant.setUser(userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId)));
            participant.setStatus(CallParticipant.ParticipantStatus.JOINED);
            participant.setAudioEnabled(true);
            participant.setVideoEnabled(true);
            call.getParticipants().add(participant);
        }

        participant.setStatus(CallParticipant.ParticipantStatus.JOINED);
        participant.setJoinedDate(LocalDateTime.now());
        callParticipantRepository.save(participant);

        call.setStatus(Call.CallStatus.ACTIVE);
        call = callRepository.save(call);

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO in joinCall: callId={}", callId);
            throw new IllegalStateException("Call mapping failed");
        }
        webSocketService.notifyCallParticipants(callId, "JOIN", callDTO);
        return callDTO;
    }

    @Override
    public CallDTO leaveCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));

        participant.setStatus(CallParticipant.ParticipantStatus.LEFT);
        participant.setLeftDate(LocalDateTime.now());
        callParticipantRepository.save(participant);

        if (callParticipantRepository.countActiveParticipants(callId) == 0) {
            call.setStatus(Call.CallStatus.ENDED);
            call.setEndedDate(LocalDateTime.now());
            call.setDuration((int) calculateDuration(call.getStartedDate(), call.getEndedDate()));
            call = callRepository.save(call);
        }

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO in leaveCall: callId={}", callId);
            throw new IllegalStateException("Call mapping failed");
        }
        webSocketService.notifyCallParticipants(callId, "LEAVE", callDTO);
        return callDTO;
    }

    @Override
    public CallDTO endCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        validationService.isCallParticipant(callId, userId);

        call.setStatus(Call.CallStatus.ENDED);
        call.setEndedDate(LocalDateTime.now());
        call.setDuration((int) calculateDuration(call.getStartedDate(), call.getEndedDate()));
        call = callRepository.save(call);

        callParticipantRepository.findByCallId(callId)
                .forEach(part -> {
                    part.setStatus(CallParticipant.ParticipantStatus.LEFT);
                    part.setLeftDate(LocalDateTime.now());
                    callParticipantRepository.save(part);
                });

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO in endCall: callId={}", callId);
            throw new IllegalStateException("Call mapping failed");
        }
        webSocketService.notifyCallParticipants(callId, "END", callDTO);
        return callDTO;
    }

    @Override
    @Transactional
    public CallDTO rejectCall(Long callId, Long userId) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));

        participant.setStatus(CallParticipant.ParticipantStatus.REJECTED);
        callParticipantRepository.save(participant);

        webSocketService.notifyCallParticipants(callId, "REJECT", userId);

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null || callDTO.getInitiatedBy() == null) {
            logger.warn("Incomplete CallDTO mapping for rejectCall: callId={}", callId);
            callDTO = new CallDTO();
            callDTO.setId(call.getId());
            callDTO.setType(call.getType());
            callDTO.setStatus(call.getStatus());
            callDTO.setStartedDate(call.getStartedDate());
            if (call.getConversation() != null) {
                callDTO.setConversationId(call.getConversation().getId());
            }
            if (call.getInitiatedBy() != null) {
                UserDTO initiatorDTO = new UserDTO();
                initiatorDTO.setId(call.getInitiatedBy().getId());
                initiatorDTO.setUsername(call.getInitiatedBy().getUsername() != null ? call.getInitiatedBy().getUsername() : "Anonymous");
                initiatorDTO.setFirstname(call.getInitiatedBy().getFirstname());
                initiatorDTO.setLastName(call.getInitiatedBy().getLastName());
                initiatorDTO.setPhotoProfile(call.getInitiatedBy().getPhotoProfile());
                callDTO.setInitiatedBy(initiatorDTO);
            }
        }

        notificationService.sendMissedCallNotification(userId, callDTO);
        return callDTO;
    }

    @Override
    public CallDTO updateCallStatus(Long callId, Call.CallStatus status) {
        Call call = callRepository.findById(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        call.setStatus(status);
        call = callRepository.save(call);
        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO in updateCallStatus: callId={}", callId);
            throw new IllegalStateException("Call mapping failed");
        }
        webSocketService.notifyCallParticipants(callId, "STATUS_UPDATE", callDTO);
        return callDTO;
    }

    @Override
    public CallDTO updateParticipantStatus(Long callId, Long userId, CallParticipant.ParticipantStatus status) {
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));
        participant.setStatus(status);
        callParticipantRepository.save(participant);
        CallDTO callDTO = getCallById(callId).orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        webSocketService.notifyCallParticipants(callId, "PARTICIPANT_STATUS", callDTO);
        return callDTO;
    }

    @Override
    public CallParticipant addParticipantToCall(Long callId, Long userId) {
        Call call = callRepository.findByIdWithParticipants(callId)
                .orElseThrow(() -> new IllegalArgumentException("Call not found: " + callId));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        Optional<CallParticipant> existingParticipant = callParticipantRepository.findByCallIdAndUserId(callId, userId);
        if (existingParticipant.isPresent()) {
            logger.warn("Participant already exists: callId={}, userId={}", callId, userId);
            return existingParticipant.get();
        }

        CallParticipant participant = new CallParticipant();
        participant.setCall(call);
        participant.setUser(user);
        participant.setStatus(CallParticipant.ParticipantStatus.INVITED);
        participant.setAudioEnabled(true);
        participant.setVideoEnabled(true);
        call.getParticipants().add(participant);
        call = callRepository.save(call);

        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null) {
            logger.error("Failed to map call to DTO in addParticipantToCall: callId={}", callId);
            throw new IllegalStateException("Call mapping failed");
        }
        webSocketService.sendCallInvitation(userId, callDTO);
        notificationService.sendCallNotification(userId, callDTO);
        return participant;
    }

    private CallDTO convertToDto(Call call) {
        CallDTO callDTO = callMapper.toDto(call);
        if (callDTO == null || callDTO.getInitiatedBy() == null) {
            logger.warn("Incomplete CallDTO mapping in convertToDto: callId={}", call.getId());
            callDTO = new CallDTO();
            callDTO.setId(call.getId());
            callDTO.setType(call.getType());
            callDTO.setStatus(call.getStatus());
            callDTO.setStartedDate(call.getStartedDate());
            callDTO.setEndedDate(call.getEndedDate());
            callDTO.setDuration(call.getDuration());
            if (call.getConversation() != null) {
                callDTO.setConversationId(call.getConversation().getId());
            }
            if (call.getInitiatedBy() != null) {
                UserDTO userDTO = new UserDTO();
                userDTO.setId(call.getInitiatedBy().getId());
                userDTO.setUsername(call.getInitiatedBy().getUsername() != null ? call.getInitiatedBy().getUsername() : "Anonymous");
                userDTO.setPhotoProfile(call.getInitiatedBy().getPhotoProfile());
                userDTO.setFirstname(call.getInitiatedBy().getFirstname());
                userDTO.setLastName(call.getInitiatedBy().getLastName());
                callDTO.setInitiatedBy(userDTO);
            }
        }
        return callDTO;
    }

    private CallParticipantDTO convertParticipantToDto(CallParticipant participant) {
        CallParticipantDTO dto = callParticipantMapper.toDto(participant);
        if (dto == null || dto.getUser() == null) {
            logger.warn("Incomplete CallParticipantDTO mapping: participantId={}", participant.getId());
            dto = new CallParticipantDTO();
            dto.setId(participant.getId());
            dto.setStatus(participant.getStatus());
            dto.setJoinedDate(participant.getJoinedDate());
            dto.setLeftDate(participant.getLeftDate());
            dto.setAudioEnabled(participant.getAudioEnabled());
            dto.setVideoEnabled(participant.getVideoEnabled());
            if (participant.getUser() != null) {
                UserDTO userDTO = new UserDTO();
                userDTO.setId(participant.getUser().getId());
                userDTO.setUsername(participant.getUser().getUsername() != null ? participant.getUser().getUsername() : "Anonymous");
                userDTO.setPhotoProfile(participant.getUser().getPhotoProfile());
                userDTO.setFirstname(participant.getUser().getFirstname());
                userDTO.setLastName(participant.getUser().getLastName());
                dto.setUser(userDTO);
            }
        }
        return dto;
    }

    @Override
    public void removeParticipantFromCall(Long callId, Long userId) {
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));
        callParticipantRepository.delete(participant);
        webSocketService.notifyCallParticipants(callId, "PARTICIPANT_REMOVED", userId);
    }

    @Override
    public List<CallParticipantDTO> getCallParticipants(Long callId) {
        return callParticipantRepository.findByCallId(callId)
                .stream()
                .map(this::convertParticipantToDto)
                .collect(Collectors.toList());
    }

    @Override
    public CallParticipantDTO toggleAudio(Long callId, Long userId) {
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));
        participant.setAudioEnabled(!participant.getAudioEnabled());
        callParticipantRepository.save(participant);
        CallParticipantDTO dto = convertParticipantToDto(participant);
        webSocketService.notifyCallParticipants(callId, "MEDIA_UPDATE", dto);
        return dto;
    }

    @Override
    public CallParticipantDTO toggleVideo(Long callId, Long userId) {
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));
        participant.setVideoEnabled(!participant.getVideoEnabled());
        callParticipantRepository.save(participant);
        CallParticipantDTO participantDTO = convertParticipantToDto(participant);
        webSocketService.notifyCallParticipants(callId, "MEDIA_UPDATE", participantDTO);
        return participantDTO;
    }

    @Override
    public CallParticipantDTO updateMediaSettings(Long callId, Long userId, boolean audioEnabled, boolean videoEnabled) {
        CallParticipant participant = callParticipantRepository.findByCallIdAndUserId(callId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Participant not found: " + userId));
        participant.setAudioEnabled(audioEnabled);
        participant.setVideoEnabled(videoEnabled);
        callParticipantRepository.save(participant);
        CallParticipantDTO participantDTO = convertParticipantToDto(participant);
        webSocketService.notifyCallParticipants(callId, "MEDIA_UPDATE", participantDTO);
        return participantDTO;
    }

    @Override
    public Page<CallDTO> getUserCallHistory(Long userId, Pageable pageable) {
        return callRepository.findByUserIdOrderByStartedDateDesc(userId, pageable)
                .map(callMapper::toDto);
    }

    @Override
    public Page<CallDTO> getConversationCallHistory(Long conversationId, Pageable pageable) {
        return callRepository.findByConversationIdOrderByStartedDateDesc(conversationId, pageable)
                .map(callMapper::toDto);
    }

    @Override
    public List<CallDTO> getRecentCalls(Long userId, int limit) {
        return callRepository.findByUserIdOrderByStartedDateDesc(userId, Pageable.ofSize(limit))
                .getContent()
                .stream()
                .map(callMapper::toDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public List<CallDTO> getMissedCalls(Long userId) {
        return callRepository.findByUserIdOrderByStartedDateDesc(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .filter(call -> call.getStatus() == Call.CallStatus.MISSED)
                .map(callMapper::toDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public int getTotalCallDuration(Long userId) {
        return callRepository.findByUserIdOrderByStartedDateDesc(userId, Pageable.unpaged())
                .getContent()
                .stream()
                .mapToInt(call -> call.getDuration() != null ? call.getDuration() : 0)
                .sum();
    }

    @Override
    public int getCallCount(Long userId) {
        return callRepository.findByUserIdOrderByStartedDateDesc(userId, Pageable.unpaged())
                .getContent()
                .size();
    }

    @Override
    public List<CallDTO> getActivesCalls() {
        return callRepository.findActiveCallsByUserId(0L, Arrays.asList(
                        Call.CallStatus.INITIATED,
                        Call.CallStatus.RINGING,
                        Call.CallStatus.ACTIVE
                ))
                .stream()
                .map(callMapper::toDto)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    @Override
    public boolean canUserJoinCall(Long callId, Long userId) {
        return callParticipantRepository.findByCallIdAndUserId(callId, userId).isPresent();
    }

    @Override
    public boolean canUserInitiateCall(Long conversationId, Long userId) {
        return validationService.canUserAccessConversation(conversationId, userId);
    }

    @Override
    public boolean isCallActive(Long callId) {
        return callRepository.findById(callId)
                .map(call -> call.getStatus() == Call.CallStatus.ACTIVE)
                .orElse(false);
    }

    @Override
    public String generateCallToken(Long callId, Long userId) {
        return UUID.randomUUID().toString();
    }

    private long calculateDuration(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null) {
            return 0;
        }
        return java.time.Duration.between(start, end).toSeconds();
    }
}