package com.example.app.Service;
/*
import com.example.app.DTOs.FaceAuthenticationDTO;
import com.example.app.DTOs.FaceAuthenticationResult;
import com.example.app.DTOs.FaceRegistrationDTO;
import com.example.app.Entities.FaceAuthenticationAttempt;
import com.example.app.Entities.FaceProfile;
import com.example.app.Entities.User;
import com.example.app.Repository.FaceAuthenticationAttemptRepository;
import com.example.app.Repository.FaceProfileRepository;
import com.example.app.utils.ImageUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.encrypt.Encryptors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Base64;
/*
@Service

public class FaceRecognitionServiceImpl implements FaceRecognitionService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(FaceDetectionServiceImpl.class);

    private final FaceProfileRepository faceProfileRepository;
    private final FaceAuthenticationAttemptRepository authAttemptRepository;
    private final FaceDetectionService faceDetectionService;
    private final FaceEncodingService faceEncodingService;
    private final ImageUtils imageUtils;
    private final JwtService jwtService;
    private final Environment environment;
    public FaceRecognitionServiceImpl(FaceProfileRepository faceProfileRepository, FaceAuthenticationAttemptRepository authAttemptRepository,FaceDetectionService faceDetectionService,FaceEncodingService faceEncodingService,JwtService jwtService,Environment environment,ImageUtils imageUtils) {
        this.faceProfileRepository = faceProfileRepository;
        this.authAttemptRepository = authAttemptRepository;
        this.faceDetectionService = faceDetectionService;
        this.faceEncodingService = faceEncodingService;
        this.jwtService = jwtService;
        this.environment = environment;
        this.imageUtils = imageUtils;
    }


    @Value("${face.recognition.max-profiles-per-user:3}")
    private int maxProfilesPerUser;

    @Value("${face.recognition.rate-limit.attempts:5}")
    private int maxAttempts;

    @Value("${face.recognition.rate-limit.window-seconds:3600}")
    private int rateLimitWindowSeconds;

    @Value("${face.recognition.encryption.enabled:false}")
    private boolean encryptionEnabled;

    @Value("${face.recognition.encryption.password:your-secret-key}")
    private String encryptionPassword;

    @Value("${face.recognition.encryption.salt:your-salt}")
    private String encryptionSalt;

    @Override
    @Transactional
    public void registerFace(User user, FaceRegistrationDTO dto) {
        try {
            // Check profile limit
            List<FaceProfile> activeProfiles = faceProfileRepository.findByUserAndIsActiveTrue(user);
            if (activeProfiles.size() >= maxProfilesPerUser) {
                throw new IllegalStateException("Maximum face profiles reached for user");
            }

            // Validate profile name
            if (faceProfileRepository.existsByUserAndProfileNameAndIsActiveTrue(user, dto.getProfileName())) {
                throw new IllegalArgumentException("Profile name already exists");
            }

            // Read and validate image
            BufferedImage image = ImageIO.read(dto.getImage().getInputStream());
            FaceDetectionService.FaceDetectionResult detectionResult = faceDetectionService.detectFaces(image);
            if (!detectionResult.isValid()) {
                throw new IllegalArgumentException(detectionResult.getMessage());
            }

            // Crop to face region
            BufferedImage faceImage = imageUtils.cropToFace(image, detectionResult.getFaceRectangles().get(0));

            // Generate encoding
            byte[] encoding = faceEncodingService.encodeFace(faceImage);
            if (encryptionEnabled) {
                encoding = encryptEncoding(encoding);
            }

            // Create and save profile
            FaceProfile profile = new FaceProfile();
            profile.setUser(user);
            profile.setFaceEncoding(encoding);
            profile.setProfileName(dto.getProfileName());
            profile.setConfidence(detectionResult.getConfidence());
            profile.setImageQualityScore(imageUtils.calculateImageQuality(faceImage));
            profile.setActive(true);
            // createdAt is set by @PrePersist
            faceProfileRepository.save(profile);

            log.info("Face profile registered for user {}: {}", user.getId(), dto.getProfileName());
        } catch (IOException e) {
            log.error("Failed to process image for registration", e);
            throw new RuntimeException("Failed to process image: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public FaceAuthenticationResult authenticateFace(FaceAuthenticationDTO dto, String ipAddress, String userAgent) {
        long startTime = System.currentTimeMillis();

        // Check rate limit
        if (isRateLimited(ipAddress)) {
            return logFailedAttempt(null, null, "Rate limit exceeded", ipAddress, userAgent, startTime);
        }

        try {
            // Read and validate image
            BufferedImage image = ImageIO.read(dto.getImage().getInputStream());
            FaceDetectionService.FaceDetectionResult detectionResult = faceDetectionService.detectFaces(image);
            if (!detectionResult.isValid()) {
                return logFailedAttempt(null, null, detectionResult.getMessage(), ipAddress, userAgent, startTime);
            }

            // Crop to face region
            BufferedImage faceImage = imageUtils.cropToFace(image, detectionResult.getFaceRectangles().get(0));

            // Generate encoding
            byte[] encoding = faceEncodingService.encodeFace(faceImage);
            if (encryptionEnabled) {
                encoding = encryptEncoding(encoding);
            }

            // Find matching profile
            List<FaceProfile> profiles = faceProfileRepository.findAll();
            for (FaceProfile profile : profiles) {
                if (!profile.isActive()) continue;

                byte[] storedEncoding = encryptionEnabled ? decryptEncoding(profile.getFaceEncoding()) :
                        profile.getFaceEncoding();
                double similarity = faceEncodingService.compareEncodings(encoding, storedEncoding);

                if (similarity >= environment.getProperty("face.recognition.similarity.threshold",
                        Double.class, 0.8)) {
                    profile.updateLastUsed();
                    faceProfileRepository.save(profile);
                    String accessToken = jwtService.generateAccessToken(profile.getUser());
                    String refreshToken = jwtService.generateRefreshToken(profile.getUser());
                    return logSuccessfulAttempt(profile.getUser(), profile, similarity,
                            accessToken, refreshToken, ipAddress, userAgent, startTime);
                }
            }

            return logFailedAttempt(null, null, "No matching face profile found", ipAddress, userAgent, startTime);
        } catch (IOException e) {
            log.error("Failed to process image for authentication", e);
            return logFailedAttempt(null, null, "Image processing failed: " + e.getMessage(),
                    ipAddress, userAgent, startTime);
        }
    }

    private boolean isRateLimited(String ipAddress) {
        LocalDateTime since = LocalDateTime.now().minusSeconds(rateLimitWindowSeconds);
        long attemptCount = authAttemptRepository.countByIpAddressAndAttemptTimeAfter(ipAddress, since);
        return attemptCount >= maxAttempts;
    }

    private byte[] encryptEncoding(byte[] encoding) {
        String encodedString = Base64.getEncoder().encodeToString(encoding);
        String encrypted = Encryptors.text(encryptionPassword, encryptionSalt).encrypt(encodedString);
        return encrypted.getBytes();
    }

    private byte[] decryptEncoding(byte[] encrypted) {
        String encryptedString = new String(encrypted);
        String decrypted = Encryptors.text(encryptionPassword, encryptionSalt).decrypt(encryptedString);
        return Base64.getDecoder().decode(decrypted);
    }

    private FaceAuthenticationResult logSuccessfulAttempt(User user, FaceProfile profile, double similarity,
                                                          String accessToken, String refreshToken, String ipAddress, String userAgent, long startTime) {
        FaceAuthenticationAttempt attempt = new FaceAuthenticationAttempt();
        attempt.setUser(user);
        attempt.setMatchedProfile(profile);
        attempt.setSuccessful(true);
        attempt.setSimilarityScore(similarity);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        // attemptTime is set by @PrePersist
        authAttemptRepository.save(attempt);

        return new FaceAuthenticationResult(true, "Authentication successful", user,
                accessToken, refreshToken, similarity, attempt.getProcessingTimeMs());
    }

    private FaceAuthenticationResult logFailedAttempt(User user, FaceProfile profile, String reason,
                                                      String ipAddress, String userAgent, long startTime) {
        FaceAuthenticationAttempt attempt = new FaceAuthenticationAttempt();
        attempt.setUser(user);
        attempt.setMatchedProfile(profile);
        attempt.setSuccessful(false);
        attempt.setFailureReason(reason);
        attempt.setIpAddress(ipAddress);
        attempt.setUserAgent(userAgent);
        attempt.setProcessingTimeMs(System.currentTimeMillis() - startTime);
        // attemptTime is set by @PrePersist
        authAttemptRepository.save(attempt);

        return new FaceAuthenticationResult(false, reason, null, null, null, 0.0, attempt.getProcessingTimeMs());
    }

    @Transactional
    public void cleanupUnusedProfiles() {
        int unusedDays = Integer.parseInt(
                environment.getProperty("face.recognition.cleanup.unused-profiles-days", "180"));
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(unusedDays);
        List<FaceProfile> unusedProfiles = faceProfileRepository.findByLastUsedBeforeOrLastUsedIsNullAndIsActiveTrue(cutoffDate);
        for (FaceProfile profile : unusedProfiles) {
            profile.setActive(false);
            faceProfileRepository.save(profile);
            log.info("Deactivated unused profile ID: {}", profile.getId());
        }
    }

    @Transactional
    public void cleanupOldAttempts() {
        int oldDays = Integer.parseInt(
                environment.getProperty("face.recognition.cleanup.old-attempts-days", "90"));
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(oldDays);
        authAttemptRepository.deleteByAttemptTimeBefore(cutoffDate);
        log.info("Deleted authentication attempts older than {}", cutoffDate);
    }
}

 */