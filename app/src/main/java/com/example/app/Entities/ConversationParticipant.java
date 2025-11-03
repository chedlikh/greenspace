package com.example.app.Entities;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity

@Table(name = "conversation_participants")
public class ConversationParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Column(name = "joined_date")
    private LocalDateTime joinedDate;

    @Column(name = "left_date")
    private LocalDateTime leftDate;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "notifications_enabled")
    private Boolean notificationsEnabled = true;

    @Column(name = "is_muted")
    private Boolean isMuted = false;

    @Column(name = "nickname")
    private String nickname;

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @PrePersist
    protected void onCreate() {
        this.joinedDate = LocalDateTime.now();
    }

    public enum ParticipantRole {
        ADMIN, MODERATOR, MEMBER
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ParticipantRole getRole() {
        return role;
    }

    public void setRole(ParticipantRole role) {
        this.role = role;
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

    public Boolean getActive() {
        return isActive;
    }

    public void setActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getLastSeen() {
        return lastSeen;
    }

    public void setLastSeen(LocalDateTime lastSeen) {
        this.lastSeen = lastSeen;
    }

    public Boolean getNotificationsEnabled() {
        return notificationsEnabled;
    }

    public void setNotificationsEnabled(Boolean notificationsEnabled) {
        this.notificationsEnabled = notificationsEnabled;
    }

    public Boolean getMuted() {
        return isMuted;
    }

    public void setMuted(Boolean muted) {
        isMuted = muted;
    }

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public Boolean getBlocked() {
        return isBlocked;
    }

    public void setBlocked(Boolean blocked) {
        isBlocked = blocked;
    }

    public ConversationParticipant(Long id, Conversation conversation, User user, ParticipantRole role, LocalDateTime joinedDate, LocalDateTime leftDate, Boolean isActive, LocalDateTime lastSeen, Boolean notificationsEnabled, Boolean isMuted, String nickname, Boolean isBlocked) {
        this.id = id;
        this.conversation = conversation;
        this.user = user;
        this.role = role;
        this.joinedDate = joinedDate;
        this.leftDate = leftDate;
        this.isActive = isActive;
        this.lastSeen = lastSeen;
        this.notificationsEnabled = notificationsEnabled;
        this.isMuted = isMuted;
        this.nickname = nickname;
        this.isBlocked = isBlocked;
    }

    public ConversationParticipant() {
    }
}

