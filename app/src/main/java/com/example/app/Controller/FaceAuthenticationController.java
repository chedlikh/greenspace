package com.example.app.Controller;
/*
import com.example.app.DTOs.FaceAuthenticationDTO;
import com.example.app.DTOs.FaceAuthenticationResult;
import com.example.app.DTOs.FaceRegistrationDTO;
import com.example.app.Entities.User;
import com.example.app.Service.FaceRecognitionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/face-auth")
@CrossOrigin(origins = "${frontend.url}")
public class FaceAuthenticationController {

    private final FaceRecognitionService faceRecognitionService;
    public FaceAuthenticationController(FaceRecognitionService faceRecognitionService) {
        this.faceRecognitionService = faceRecognitionService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> registerFace(@AuthenticationPrincipal User user,
                                               @Valid @ModelAttribute FaceRegistrationDTO dto) {
        faceRecognitionService.registerFace(user, dto);
        return ResponseEntity.ok("Face profile registered successfully");
    }

    @PostMapping("/login")
    public ResponseEntity<FaceAuthenticationResult> authenticateFace(
            @Valid @ModelAttribute FaceAuthenticationDTO dto,
            HttpServletRequest request) {
        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        FaceAuthenticationResult result = faceRecognitionService.authenticateFace(dto, ipAddress, userAgent);
        return ResponseEntity.status(result.isSuccess() ? 200 : 401).body(result);
    }
}


 */