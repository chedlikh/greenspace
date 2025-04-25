package com.example.app.DTOs;

import com.example.app.Entities.Publication;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

@NoArgsConstructor
public class PublicationUpdateDTO {
    private String content;
    private Publication.PrivacyLevel privacyLevel;
    private String location;
    private String feeling;

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

    public PublicationUpdateDTO(String content, Publication.PrivacyLevel privacyLevel, String location, String feeling) {
        this.content = content;
        this.privacyLevel = privacyLevel;
        this.location = location;
        this.feeling = feeling;
    }
}
