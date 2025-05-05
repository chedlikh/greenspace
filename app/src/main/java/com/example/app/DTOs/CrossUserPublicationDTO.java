package com.example.app.DTOs;

import com.example.app.Entities.Publication;

public class CrossUserPublicationDTO {
    private String targetUsername; // Username of the user receiving the publication
    private String content;
    private Publication.PrivacyLevel privacyLevel;
    private String location;
    private String feeling;

    // Constructors
    public CrossUserPublicationDTO() {
    }

    public CrossUserPublicationDTO(String targetUsername, String content,
                                   Publication.PrivacyLevel privacyLevel,
                                   String location, String feeling) {
        this.targetUsername = targetUsername;
        this.content = content;
        this.privacyLevel = privacyLevel;
        this.location = location;
        this.feeling = feeling;
    }

    // Getters and setters
    public String getTargetUsername() {
        return targetUsername;
    }

    public void setTargetUsername(String targetUsername) {
        this.targetUsername = targetUsername;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Publication.PrivacyLevel getPrivacyLevel() {
        return privacyLevel;
    }

    public void setPrivacyLevel(Publication.PrivacyLevel privacyLevel) {
        this.privacyLevel = privacyLevel;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getFeeling() {
        return feeling;
    }

    public void setFeeling(String feeling) {
        this.feeling = feeling;
    }

}

