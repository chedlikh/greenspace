package com.example.app.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_profiles")
public class FaceProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] faceEncoding;

    @Column(name = "profile_name", nullable = false)
    private String profileName;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "confidence", nullable = false)
    private double confidence;

    @Column(name = "image_quality_score")
    private double imageQualityScore;

    public FaceProfile() {
    }

    public FaceProfile(User user, byte[] faceEncoding, String profileName, LocalDateTime createdAt,
                       LocalDateTime lastUsed, boolean isActive, double confidence, double imageQualityScore) {
        this.user = user;
        this.faceEncoding = faceEncoding;
        this.profileName = profileName;
        this.createdAt = createdAt;
        this.lastUsed = lastUsed;
        this.isActive = isActive;
        this.confidence = confidence;
        this.imageQualityScore = imageQualityScore;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateLastUsed() {
        this.lastUsed = LocalDateTime.now();
    }

    public boolean isHighQuality() {
        return this.confidence >= 0.85 && this.imageQualityScore >= 0.8;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public byte[] getFaceEncoding() {
        return faceEncoding;
    }

    public void setFaceEncoding(byte[] faceEncoding) {
        this.faceEncoding = faceEncoding;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public double getImageQualityScore() {
        return imageQualityScore;
    }

    public void setImageQualityScore(double imageQualityScore) {
        this.imageQualityScore = imageQualityScore;
    }
}