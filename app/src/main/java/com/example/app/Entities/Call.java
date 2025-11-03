package com.example.app.Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "calls")
public class Call {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private CallType type = CallType.VOICE;

    @Enumerated(EnumType.STRING)
    private CallStatus status = CallStatus.INITIATED;

    @Column(name = "started_date")
    private LocalDateTime startedDate;

    @Column(name = "ended_date")
    private LocalDateTime endedDate;

    @Column(name = "duration")
    private Integer duration;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiated_by")
    private User initiatedBy;

    @OneToMany(mappedBy = "call", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CallParticipant> participants = new ArrayList<>(); // Removed @JsonIgnore

    @PrePersist
    protected void onCreate() {
        this.startedDate = LocalDateTime.now();
    }

    public enum CallType {
        VOICE, VIDEO
    }

    public enum CallStatus {
        INITIATED, RINGING, ACTIVE, ENDED, MISSED, REJECTED, BUSY
    }

    // Getters and setters (unchanged)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public CallType getType() { return type; }
    public void setType(CallType type) { this.type = type; }
    public CallStatus getStatus() { return status; }
    public void setStatus(CallStatus status) { this.status = status; }
    public LocalDateTime getStartedDate() { return startedDate; }
    public void setStartedDate(LocalDateTime startedDate) { this.startedDate = startedDate; }
    public LocalDateTime getEndedDate() { return endedDate; }
    public void setEndedDate(LocalDateTime endedDate) { this.endedDate = endedDate; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    public User getInitiatedBy() { return initiatedBy; }
    public void setInitiatedBy(User initiatedBy) { this.initiatedBy = initiatedBy; }
    public List<CallParticipant> getParticipants() { return participants; }
    public void setParticipants(List<CallParticipant> participants) { this.participants = participants; }

    public Call(Long id, CallType type, CallStatus status, LocalDateTime startedDate, LocalDateTime endedDate, Integer duration, Conversation conversation, User initiatedBy, List<CallParticipant> participants) {
        this.id = id;
        this.type = type;
        this.status = status;
        this.startedDate = startedDate;
        this.endedDate = endedDate;
        this.duration = duration;
        this.conversation = conversation;
        this.initiatedBy = initiatedBy;
        this.participants = participants;
    }

    public Call() {}

}