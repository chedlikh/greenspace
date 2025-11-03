package com.example.app.DTOs;

public class CallSignalDTO {
    private Long callId;
    private Long fromUserId;
    private String offer;
    private String answer;
    private String candidate;

    public CallSignalDTO(Long callId, Long fromUserId, String offer, String answer, String candidate) {
        this.callId = callId;
        this.fromUserId = fromUserId;
        this.offer = offer;
        this.answer = answer;
        this.candidate = candidate;
    }

    // Getters and setters
    public Long getCallId() { return callId; }
    public void setCallId(Long callId) { this.callId = callId; }
    public Long getFromUserId() { return fromUserId; }
    public void setFromUserId(Long fromUserId) { this.fromUserId = fromUserId; }
    public String getOffer() { return offer; }
    public void setOffer(String offer) { this.offer = offer; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public String getCandidate() { return candidate; }
    public void setCandidate(String candidate) { this.candidate = candidate; }
}
