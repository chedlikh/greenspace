package com.example.app.Service;

import com.example.app.DTOs.FaceAuthenticationDTO;
import com.example.app.DTOs.FaceAuthenticationResult;
import com.example.app.DTOs.FaceRegistrationDTO;
import com.example.app.Entities.User;

public interface FaceRecognitionService {

    void registerFace(User user, FaceRegistrationDTO dto);

    FaceAuthenticationResult authenticateFace(FaceAuthenticationDTO dto, String ipAddress, String userAgent);
}
