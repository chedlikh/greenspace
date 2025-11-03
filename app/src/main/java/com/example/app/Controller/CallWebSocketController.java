package com.example.app.Controller;

import com.example.app.DTOs.CallParticipantDTO;
import com.example.app.Service.CallService;
import com.example.app.Service.WebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;
import java.util.List;
import java.util.Map;

@Controller
public class CallWebSocketController {

    @Autowired
    private CallService callService;

    @Autowired
    private WebSocketService webSocketService;

    @MessageMapping("/webrtc/offer")
    public void processWebRTCOffer(@Payload Map<String, Object> payload) {
        Long callId = Long.valueOf(payload.get("callId").toString());
        Long fromUserId = Long.valueOf(payload.get("fromUserId").toString());
        String offer = payload.get("offer").toString();
        List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
        participants.stream()
                .filter(p -> !p.getUser().getId().equals(fromUserId))
                .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "offer",
                        "offer", offer
                )));
    }

    @MessageMapping("/webrtc/answer")
    public void processWebRTCAnswer(@Payload Map<String, Object> payload) {
        Long callId = Long.valueOf(payload.get("callId").toString());
        Long fromUserId = Long.valueOf(payload.get("fromUserId").toString());
        String answer = payload.get("answer").toString();
        List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
        participants.stream()
                .filter(p -> !p.getUser().getId().equals(fromUserId))
                .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "answer",
                        "answer", answer
                )));
    }

    @MessageMapping("/webrtc/ice")
    public void processICECandidate(@Payload Map<String, Object> payload) {
        Long callId = Long.valueOf(payload.get("callId").toString());
        Long fromUserId = Long.valueOf(payload.get("fromUserId").toString());
        String candidate = payload.get("candidate").toString();
        List<CallParticipantDTO> participants = callService.getCallParticipants(callId);
        participants.stream()
                .filter(p -> !p.getUser().getId().equals(fromUserId))
                .forEach(target -> webSocketService.sendWebRTCSignal(target.getUser().getId(), Map.of(
                        "callId", callId,
                        "fromUserId", fromUserId,
                        "type", "iceCandidate",
                        "candidate", candidate
                )));
    }
}