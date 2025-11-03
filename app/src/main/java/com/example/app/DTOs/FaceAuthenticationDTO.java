package com.example.app.DTOs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data

public class FaceAuthenticationDTO {

    @NotNull(message = "Image is required")
    private MultipartFile image;

    private String sessionId;

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public FaceAuthenticationDTO() {
    }

    public FaceAuthenticationDTO(MultipartFile image, String sessionId) {
        this.image = image;
        this.sessionId = sessionId;
    }
}
