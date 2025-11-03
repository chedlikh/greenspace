package com.example.app.Entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "face_auth_attempts")
public class FaceAuthenticationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matched_profile_id")
    private FaceProfile matchedProfile;

    @Column(name = "attempt_time", nullable = false)
    private LocalDateTime attemptTime;

    @Column(name = "successful", nullable = false)
    private boolean successful;

    @Column(name = "similarity_score")
    private double similarityScore;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "user_agent")
    private String userAgent;

    @Column(name = "failure_reason")
    private String failureReason;

    @Column(name = "processing_time_ms")
    private long processingTimeMs;

    public FaceAuthenticationAttempt() {
    }

    public FaceAuthenticationAttempt(User user, FaceProfile matchedProfile, boolean successful) {
        this.user = user;
        this.matchedProfile = matchedProfile;
        this.successful = successful;
    }

    @PrePersist
    protected void onCreate() {
        this.attemptTime = LocalDateTime.now();
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

    public FaceProfile getMatchedProfile() {
        return matchedProfile;
    }

    public void setMatchedProfile(FaceProfile matchedProfile) {
        this.matchedProfile = matchedProfile;
    }

    public LocalDateTime getAttemptTime() {
        return attemptTime;
    }

    public void setAttemptTime(LocalDateTime attemptTime) {
        this.attemptTime = attemptTime;
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public double getSimilarityScore() {
        return similarityScore;
    }

    public void setSimilarityScore(double similarityScore) {
        this.similarityScore = similarityScore;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }
}