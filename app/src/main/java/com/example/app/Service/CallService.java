package com.example.app.Service;

import com.example.app.DTOs.CallCreateDTO;
import com.example.app.DTOs.CallDTO;
import com.example.app.DTOs.CallParticipantDTO;
import com.example.app.DTOs.CallPreferencesDTO;
import com.example.app.Entities.Call;
import com.example.app.Entities.CallParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface CallService {


    CallDTO initiateCall(CallCreateDTO callCreateDTO);

    CallDTO initiateDirectCall(Long targetUserId, Call.CallType type, Long initiatorId);

    CallPreferencesDTO getCallPreferences(Long userId);

    CallDTO initiateGroupCall(CallCreateDTO callCreateDTO);

    Optional<CallDTO> getCallById(Long callId);
    CallDTO joinCall(Long callId, Long userId);
    CallDTO leaveCall(Long callId, Long userId);
    CallDTO endCall(Long callId, Long userId);
    CallDTO rejectCall(Long callId, Long userId);
    CallDTO updateCallStatus(Long callId, Call.CallStatus status);
    CallDTO updateParticipantStatus(Long callId, Long userId, CallParticipant.ParticipantStatus status);
    CallParticipant addParticipantToCall(Long callId, Long userId); // Changed return type
    void removeParticipantFromCall(Long callId, Long userId);
    List<CallParticipantDTO> getCallParticipants(Long callId);
    CallParticipantDTO toggleAudio(Long callId, Long userId);
    CallParticipantDTO toggleVideo(Long callId, Long userId);
    CallParticipantDTO updateMediaSettings(Long callId, Long userId, boolean audioEnabled, boolean videoEnabled);
    Page<CallDTO> getUserCallHistory(Long userId, Pageable pageable);
    Page<CallDTO> getConversationCallHistory(Long conversationId, Pageable pageable);
    List<CallDTO> getRecentCalls(Long userId, int limit);
    List<CallDTO> getMissedCalls(Long userId);
    int getTotalCallDuration(Long userId);
    int getCallCount(Long userId);
    List<CallDTO> getActivesCalls();
    boolean canUserJoinCall(Long callId, Long userId);
    boolean canUserInitiateCall(Long conversationId, Long userId);
    boolean isCallActive(Long callId);
    String generateCallToken(Long callId, Long userId);
   
}