package com.example.app.DTOs;

import com.example.app.Entities.Call;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CallCreateDTO {
    private Call.CallType type;
    private Long conversationId;
    private Long initiatedById;
    private LocalDateTime startedDate;

    public Call.CallType getType() {
        return type;
    }

    public void setType(Call.CallType type) {
        this.type = type;
    }

    public Long getConversationId() {
        return conversationId;
    }

    public void setConversationId(Long conversationId) {
        this.conversationId = conversationId;
    }

    public Long getInitiatedById() {
        return initiatedById;
    }

    public void setInitiatedById(Long initiatedById) {
        this.initiatedById = initiatedById;
    }

    public LocalDateTime getStartedDate() {
        return startedDate;
    }

    public void setStartedDate(LocalDateTime startedDate) {
        this.startedDate = startedDate;
    }

    public CallCreateDTO() {
    }

    public CallCreateDTO(Call.CallType type, Long conversationId, Long initiatedById, LocalDateTime startedDate) {
        this.type = type;
        this.conversationId = conversationId;
        this.initiatedById = initiatedById;
        this.startedDate = startedDate;
    }
}