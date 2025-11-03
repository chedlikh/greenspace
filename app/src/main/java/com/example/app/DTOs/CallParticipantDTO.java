package com.example.app.DTOs;

import com.example.app.Entities.CallParticipant;
import lombok.Data;

import java.time.LocalDateTime;

@Data

public class CallParticipantDTO {
    private Long id;
    private UserDTO user;
    private CallParticipant.ParticipantStatus status;
    private LocalDateTime joinedDate;
    private LocalDateTime leftDate;
    private Boolean isAudioEnabled;
    private Boolean isVideoEnabled;

    public CallParticipantDTO() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public CallParticipant.ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(CallParticipant.ParticipantStatus status) {
        this.status = status;
    }

    public LocalDateTime getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(LocalDateTime joinedDate) {
        this.joinedDate = joinedDate;
    }

    public LocalDateTime getLeftDate() {
        return leftDate;
    }

    public void setLeftDate(LocalDateTime leftDate) {
        this.leftDate = leftDate;
    }

    public Boolean getAudioEnabled() {
        return isAudioEnabled;
    }

    public void setAudioEnabled(Boolean audioEnabled) {
        isAudioEnabled = audioEnabled;
    }

    public Boolean getVideoEnabled() {
        return isVideoEnabled;
    }

    public void setVideoEnabled(Boolean videoEnabled) {
        isVideoEnabled = videoEnabled;
    }

    public CallParticipantDTO(Long id, UserDTO user, CallParticipant.ParticipantStatus status, LocalDateTime joinedDate, LocalDateTime leftDate, Boolean isAudioEnabled, Boolean isVideoEnabled) {
        this.id = id;
        this.user = user;
        this.status = status;
        this.joinedDate = joinedDate;
        this.leftDate = leftDate;
        this.isAudioEnabled = isAudioEnabled;
        this.isVideoEnabled = isVideoEnabled;
    }
}
