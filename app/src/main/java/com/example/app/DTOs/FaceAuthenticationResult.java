package com.example.app.DTOs;

import com.example.app.Entities.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

public class FaceAuthenticationResult {

    private boolean success;
    private String message;
    private User user;
    private String accessToken;
    private String refreshToken;
    private double confidence;
    private long processingTimeMs;

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getRefreshToken() {
        return refreshToken;
    }

    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }

    public double getConfidence() {
        return confidence;
    }

    public void setConfidence(double confidence) {
        this.confidence = confidence;
    }

    public long getProcessingTimeMs() {
        return processingTimeMs;
    }

    public void setProcessingTimeMs(long processingTimeMs) {
        this.processingTimeMs = processingTimeMs;
    }

    public FaceAuthenticationResult() {
    }

    public FaceAuthenticationResult(boolean success, String message, User user, String accessToken, String refreshToken, double confidence, long processingTimeMs) {
        this.success = success;
        this.message = message;
        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.confidence = confidence;
        this.processingTimeMs = processingTimeMs;
    }
}