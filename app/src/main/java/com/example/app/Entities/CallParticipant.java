package com.example.app.Entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity

@Table(name = "call_participants")
public class CallParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "call_id")
    private Call call;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private ParticipantStatus status = ParticipantStatus.INVITED;

    @Column(name = "joined_date")
    private LocalDateTime joinedDate;

    @Column(name = "left_date")
    private LocalDateTime leftDate;

    @Column(name = "is_audio_enabled")
    private Boolean isAudioEnabled = true;

    @Column(name = "is_video_enabled")
    private Boolean isVideoEnabled = true;

    public enum ParticipantStatus {
        INVITED, JOINED, LEFT, REJECTED, MISSED
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Call getCall() {
        return call;
    }

    public void setCall(Call call) {
        this.call = call;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ParticipantStatus getStatus() {
        return status;
    }

    public void setStatus(ParticipantStatus status) {
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

    public CallParticipant(Long id, Call call, User user, ParticipantStatus status, LocalDateTime joinedDate, LocalDateTime leftDate, Boolean isAudioEnabled, Boolean isVideoEnabled) {
        this.id = id;
        this.call = call;
        this.user = user;
        this.status = status;
        this.joinedDate = joinedDate;
        this.leftDate = leftDate;
        this.isAudioEnabled = isAudioEnabled;
        this.isVideoEnabled = isVideoEnabled;
    }

    public CallParticipant() {
    }
}

