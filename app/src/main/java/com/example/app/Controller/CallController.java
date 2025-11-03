package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Call;
import com.example.app.Entities.CallParticipant;
import com.example.app.Mappers.CallParticipantMapper;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.CallService;
import com.example.app.Service.ChatValidationService;
import org.modelmapper.ModelMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/calls")
public class CallController {

    @Autowired
    private CallService callService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ChatValidationService validationService;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private CallParticipantMapper callParticipantMapper;

    private static final Logger logger = LoggerFactory.getLogger(CallController.class);

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("User not found"))
                .getId();
    }

    @PostMapping
    public ResponseEntity<CallDTO> initiateCall(@RequestBody CallCreateDTO callCreateDTO) {
        try {
            validationService.canUserAccessConversation(getCurrentUserId(), callCreateDTO.getConversationId());
            callCreateDTO.setInitiatedById(getCurrentUserId());
            CallDTO callDTO = callService.initiateCall(callCreateDTO);
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to initiate call: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/direct/{targetUserId}")
    public ResponseEntity<CallDTO> initiateDirectCall(
            @PathVariable Long targetUserId,
            @RequestBody Map<String, String> request) {
        try {
            String type = request.get("type");
            if (type == null || (!type.equalsIgnoreCase("VIDEO") && !type.equalsIgnoreCase("VOICE"))) {
                logger.error("Invalid call type: {}", type);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            Long currentUserId = getCurrentUserId();
            if (!validationService.canUsersStartDirectConversation(currentUserId, targetUserId)) {
                logger.error("User {} cannot initiate direct call with {}", currentUserId, targetUserId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
            }
            CallDTO callDTO = callService.initiateDirectCall(targetUserId, Call.CallType.valueOf(type.toUpperCase()), currentUserId);
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to initiate direct call for user {}: {}", targetUserId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/group")
    public ResponseEntity<CallDTO> initiateGroupCall(@RequestBody CallCreateDTO callCreateDTO) {
        try {
            validationService.canUserAccessConversation(getCurrentUserId(), callCreateDTO.getConversationId());
            callCreateDTO.setInitiatedById(getCurrentUserId());
            CallDTO callDTO = callService.initiateGroupCall(callCreateDTO);
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to initiate group call: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CallDTO> getCallById(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            return callService.getCallById(id)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Failed to get call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<CallDTO> joinCall(@PathVariable Long id) {
        try {
            validationService.canUserJoinCall(getCurrentUserId(), id);
            CallDTO callDTO = callService.joinCall(id, getCurrentUserId());
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to join call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/leave")
    public ResponseEntity<CallDTO> leaveCall(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallDTO callDTO = callService.leaveCall(id, getCurrentUserId());
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to leave call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<CallDTO> endCall(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallDTO callDTO = callService.endCall(id, getCurrentUserId());
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to end call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<CallDTO> rejectCall(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallDTO callDTO = callService.rejectCall(id, getCurrentUserId());
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to reject call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CallDTO> updateCallStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusMap) {
        try {
            String status = statusMap.get("status");
            if (status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallDTO callDTO = callService.updateCallStatus(id, Call.CallStatus.valueOf(status.toUpperCase()));
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to update call status for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}/participants/{userId}/status")
    public ResponseEntity<CallDTO> updateParticipantStatus(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody Map<String, String> statusMap) {
        try {
            String status = statusMap.get("status");
            if (status == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallDTO callDTO = callService.updateParticipantStatus(
                    id,
                    userId,
                    CallParticipant.ParticipantStatus.valueOf(status.toUpperCase())
            );
            return ResponseEntity.ok(callDTO);
        } catch (Exception e) {
            logger.error("Failed to update participant status for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/participants/{userId}")
    public ResponseEntity<CallParticipantDTO> addParticipantToCall(
            @PathVariable Long id,
            @PathVariable Long userId) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallParticipant participant = callService.addParticipantToCall(id, userId);
            CallParticipantDTO participantDTO = callParticipantMapper.toDto(participant);
            return ResponseEntity.status(HttpStatus.CREATED).body(participantDTO);
        } catch (Exception e) {
            logger.error("Failed to add participant {} to call {}: {}", userId, id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/{id}/participants/{userId}")
    public ResponseEntity<Void> removeParticipantFromCall(
            @PathVariable Long id,
            @PathVariable Long userId) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            callService.removeParticipantFromCall(id, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            logger.error("Failed to remove participant {} from call {}: {}", userId, id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/{id}/participants")
    public ResponseEntity<List<CallParticipantDTO>> getCallParticipants(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            List<CallParticipantDTO> participants = callService.getCallParticipants(id);
            return ResponseEntity.ok(participants);
        } catch (Exception e) {
            logger.error("Failed to get participants for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/audio")
    public ResponseEntity<CallParticipantDTO> toggleAudio(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallParticipantDTO participantDTO = callService.toggleAudio(id, getCurrentUserId());
            return ResponseEntity.ok(participantDTO);
        } catch (Exception e) {
            logger.error("Failed to toggle audio for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PostMapping("/{id}/video")
    public ResponseEntity<CallParticipantDTO> toggleVideo(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallParticipantDTO participantDTO = callService.toggleVideo(id, getCurrentUserId());
            return ResponseEntity.ok(participantDTO);
        } catch (Exception e) {
            logger.error("Failed to toggle video for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @PutMapping("/{id}/media")
    public ResponseEntity<CallParticipantDTO> updateMediaSettings(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> settings) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            CallParticipantDTO participantDTO = callService.updateMediaSettings(
                    id,
                    getCurrentUserId(),
                    settings.get("audioEnabled"),
                    settings.get("videoEnabled")
            );
            return ResponseEntity.ok(participantDTO);
        } catch (Exception e) {
            logger.error("Failed to update media settings for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Page<CallDTO>> getUserCallHistory(Pageable pageable) {
        try {
            Page<CallDTO> history = callService.getUserCallHistory(getCurrentUserId(), pageable);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Failed to get call history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/conversation/{conversationId}/history")
    public ResponseEntity<Page<CallDTO>> getConversationCallHistory(
            @PathVariable Long conversationId,
            Pageable pageable) {
        try {
            validationService.canUserAccessConversation(getCurrentUserId(), conversationId);
            Page<CallDTO> history = callService.getConversationCallHistory(conversationId, pageable);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            logger.error("Failed to get conversation call history for {}: {}", conversationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<CallDTO>> getRecentCalls(@RequestParam int limit) {
        try {
            List<CallDTO> recentCalls = callService.getRecentCalls(getCurrentUserId(), limit);
            return ResponseEntity.ok(recentCalls);
        } catch (Exception e) {
            logger.error("Failed to get recent calls: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/missed")
    public ResponseEntity<List<CallDTO>> getMissedCalls() {
        try {
            List<CallDTO> missedCalls = callService.getMissedCalls(getCurrentUserId());
            return ResponseEntity.ok(missedCalls);
        } catch (Exception e) {
            logger.error("Failed to get missed calls: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/active")
    public ResponseEntity<List<CallDTO>> getActiveCalls() {
        try {
            List<CallDTO> activeCalls = callService.getActivesCalls();
            return ResponseEntity.ok(activeCalls);
        } catch (Exception e) {
            logger.error("Failed to get active calls: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/{id}/token")
    public ResponseEntity<String> generateCallToken(@PathVariable Long id) {
        try {
            validationService.canUserAccessCall(id, getCurrentUserId());
            String token = callService.generateCallToken(id, getCurrentUserId());
            return ResponseEntity.ok(token);
        } catch (Exception e) {
            logger.error("Failed to generate call token for call {}: {}", id, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @GetMapping("/preferences")
    public ResponseEntity<CallPreferencesDTO> getCallPreferences() {
        try {
            CallPreferencesDTO preferences = callService.getCallPreferences(getCurrentUserId());
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            logger.error("Failed to get call preferences: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }
}