package com.example.app.Entities;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class CallPreferences {
    @Id
    private Long userId;
    private boolean audioEnabled;
    private boolean videoEnabled;

    public CallPreferences() {}

    public CallPreferences(Long userId, boolean audioEnabled, boolean videoEnabled) {
        this.userId = userId;
        this.audioEnabled = audioEnabled;
        this.videoEnabled = videoEnabled;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isAudioEnabled() {
        return audioEnabled;
    }

    public void setAudioEnabled(boolean audioEnabled) {
        this.audioEnabled = audioEnabled;
    }

    public boolean isVideoEnabled() {
        return videoEnabled;
    }

    public void setVideoEnabled(boolean videoEnabled) {
        this.videoEnabled = videoEnabled;
    }
}
