package com.example.app.DTOs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Data

public class FaceRegistrationDTO {

    @NotBlank(message = "Image is required")
    private MultipartFile image;

    @NotBlank(message = "Profile name is required")
    @Size(max = 50, message = "Profile name cannot exceed 50 characters")
    private String profileName;

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }

    public String getProfileName() {
        return profileName;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public FaceRegistrationDTO() {
    }

    public FaceRegistrationDTO(MultipartFile image, String profileName) {
        this.image = image;
        this.profileName = profileName;
    }
}