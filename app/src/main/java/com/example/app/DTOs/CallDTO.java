package com.example.app.DTOs;

import com.example.app.Entities.Call;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CallDTO {
    private Long id;
    private Call.CallType type;
    private Call.CallStatus status;
    private LocalDateTime startedDate;
    private LocalDateTime endedDate;
    private Integer duration;
    private Long conversationId;
    private UserDTO initiatedBy;
    private List<CallParticipantDTO> participants;

    public CallDTO() {
    }

    public CallDTO(Long id, Call.CallType type, Call.CallStatus status, LocalDateTime startedDate, LocalDateTime endedDate, Integer duration, Long conversationId, UserDTO initiatedBy, List<CallParticipantDTO> participants) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.startedDate = startedDate;
        this.endedDate = endedDate;
        this.duration = duration;
        this.conversationId = conversationId;
        this.initiatedBy = initiatedBy;
        this.participants = participants;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Call.CallType getType() {
        return type;
    }

    public void setType(Call.CallType type) {
        this.type = type;
    }

    public Call.CallStatus getStatus() {
        return status;
    }

    public void setStatus(Call.CallStatus status) {
        this.status = status;
    }

    public LocalDateTime getStartedDate() {
        return startedDate;
    }

    public void setStartedDate(LocalDateTime startedDate) {
        this.startedDate = startedDate;
    }

    public LocalDateTime getEndedDate() {
        return endedDate;
    }

    public void setEndedDate(LocalDateTime endedDate) {
        this.endedDate = endedDate;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public UserDTO getInitiatedBy() {
        return initiatedBy;
    }

    public void setInitiatedBy(UserDTO initiatedBy) {
        this.initiatedBy = initiatedBy;
    }

    public List<CallParticipantDTO> getParticipants() {
        return participants;
    }

    public void setParticipants(List<CallParticipantDTO> participants) {
        this.participants = participants;
    }
}

