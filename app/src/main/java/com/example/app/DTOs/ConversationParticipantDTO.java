package com.example.app.DTOs;

import com.example.app.Entities.ConversationParticipant;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConversationParticipantDTO {
    private Long id;
    private UserDTO user;
    private ConversationParticipant.ParticipantRole role;
    private LocalDateTime joinedDate;

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

    public ConversationParticipant.ParticipantRole getRole() {
        return role;
    }

    public void setRole(ConversationParticipant.ParticipantRole role) {
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

    public String getPhotoProfile() {
        return photoProfile;
    }

    public void setPhotoProfile(String photoProfile) {
        this.photoProfile = photoProfile;
    }

    private LocalDateTime leftDate;
    private Boolean isActive;
    private LocalDateTime lastSeen;
    private Boolean notificationsEnabled;
    private Boolean isMuted;
    private String nickname;
    private Boolean isBlocked;
    private String photoProfile;

    public ConversationParticipantDTO() {
    }

    public ConversationParticipantDTO(Long id, UserDTO user, ConversationParticipant.ParticipantRole role, LocalDateTime joinedDate, LocalDateTime leftDate, Boolean isActive, LocalDateTime lastSeen, Boolean notificationsEnabled, Boolean isMuted, String nickname, Boolean isBlocked, String photoProfile) {
        this.id = id;
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
        this.photoProfile = photoProfile;
    }
}
