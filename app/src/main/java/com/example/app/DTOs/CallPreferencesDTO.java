package com.example.app.DTOs;

public class CallPreferencesDTO {
    private boolean audioEnabled;
    private boolean videoEnabled;

    // Add no-arg constructor for ModelMapper
    public CallPreferencesDTO() {
    }

    public CallPreferencesDTO(boolean audioEnabled, boolean videoEnabled) {
        this.audioEnabled = audioEnabled;
        this.videoEnabled = videoEnabled;
    }

    // Getters and setters
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