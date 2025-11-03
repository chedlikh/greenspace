package com.example.app.Service;

import com.example.app.Entities.AuthenticationResponse;
import com.example.app.Entities.PasswordResetToken;
import com.example.app.Entities.Role;
import com.example.app.Entities.Token;
import com.example.app.Entities.User;
import com.example.app.Repository.PasswordResetTokenRepository;
import com.example.app.Repository.RoleRepo;
import com.example.app.Repository.TokenRepository;
import com.example.app.Repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AuthenticationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final RoleRepo roleRepo;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    public AuthenticationService(UserRepo userRepo,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService,
                                 TokenRepository tokenRepository,
                                 AuthenticationManager authenticationManager,
                                 RoleRepo roleRepo,
                                 PasswordResetTokenRepository passwordResetTokenRepository,
                                 EmailService emailService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenRepository = tokenRepository;
        this.authenticationManager = authenticationManager;
        this.roleRepo = roleRepo;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    // Existing methods (register, authenticate, etc.) remain unchanged
    public AuthenticationResponse register(User request, String roleName) {
        if (userRepo.findByUsername(request.getUsername()).isPresent()) {
            return new AuthenticationResponse(null, null, "User already exists");
        }

        List<User> existingUsers = userRepo.findByPhone(request.getPhone());
        if (!existingUsers.isEmpty()) {
            return new AuthenticationResponse(null, null, "This phone number is already registered.");
        }
        Set<Role> roles = new HashSet<>();
        Role role = roleRepo.findByRoleName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found for name: " + roleName));
        roles.add(role);

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstname(request.getFirstname());
        user.setLastName(request.getLastName());
        user.setUsername(request.getUsername());
        user.setCountry(request.getCountry());
        user.setGender(request.getGender());
        user.setAdress(request.getAdress());
        user.setValide(false);
        user.setBirthday(request.getBirthday());
        user.setPhone(request.getPhone());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(roles);
        user = userRepo.save(user);

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        saveUserToken(accessToken, refreshToken, user);

        return new AuthenticationResponse(accessToken, refreshToken, "User registration was successful");
    }

    public AuthenticationResponse authenticate(User request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        User user = userRepo.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));
        user.setConnect(true);
        userRepo.save(user);

        return createAuthenticationResponse(user, "User login was successful");
    }

    public AuthenticationResponse createAuthenticationResponse(User user, String message) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        revokeAllTokensByUser(user);
        saveUserToken(accessToken, refreshToken, user);

        Set<String> roles = user.getRoles().stream()
                .map(Role::getRoleName)
                .collect(Collectors.toSet());

        return new AuthenticationResponse(accessToken, refreshToken, message, user.getUsername(),
                user.getFirstname(), user.getLastName(), roles);
    }

    private void revokeAllTokensByUser(User user) {
        List<Token> validTokens = tokenRepository.findAllByUser(user);
        if (!validTokens.isEmpty()) {
            validTokens.forEach(token -> token.setLoggedOut(true));
            tokenRepository.saveAll(validTokens);
        }
    }

    private void saveUserToken(String accessToken, String refreshToken, User user) {
        Token token = new Token();
        token.setAccessToken(accessToken);
        token.setRefreshToken(refreshToken);
        token.setLoggedOut(false);
        token.setUser(user);
        tokenRepository.save(token);
    }

    @Scheduled(cron = "0 0 * * * ?")
    public void cleanUpExpiredTokens() {
        tokenRepository.deleteAllByLoggedOutTrueAndExpirationBefore(LocalDateTime.now());
    }

    public String encodePassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    @Transactional
    public Map<String, String> createPasswordResetToken(String emailOrPhone, boolean requestAdmin) {
        logger.debug("Processing password reset request for: {}", emailOrPhone);
        User user = null;
        if (emailOrPhone.contains("@")) {
            Optional<User> userOptional = userRepo.findByEmail(emailOrPhone);
            if (userOptional.isEmpty()) {
                logger.warn("No user found with email: {}", emailOrPhone);
                return Map.of("message", "User not found with email: " + emailOrPhone);
            }
            user = userOptional.get();
        } else {
            try {
                Long phone = Long.parseLong(emailOrPhone);
                user = userRepo.findByPhone(phone).stream()
                        .findFirst()
                        .orElse(null);
                if (user == null) {
                    logger.warn("No user found with phone: {}", emailOrPhone);
                    return Map.of("message", "User not found with phone: " + emailOrPhone);
                }
            } catch (NumberFormatException e) {
                logger.error("Invalid phone number format: {}", emailOrPhone);
                return Map.of("message", "Invalid phone number format");
            }
        }

        if (requestAdmin) {
            Map<String, String> adminEmailResult = sendAdminResetRequest(user);
            if (adminEmailResult.get("message").startsWith("Failed")) {
                logger.warn("Admin reset request failed for user {}: {}", user.getEmail(), adminEmailResult.get("message"));
                return adminEmailResult; // Propagate email failure
            }
            return Map.of("message", "Password reset request sent to admin for user: " + user.getEmail());
        }

        try {
            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(
                    token,
                    user,
                    LocalDateTime.now().plusHours(24)
            );
            passwordResetTokenRepository.deleteByUserId(user.getId());
            passwordResetTokenRepository.save(resetToken);

            Map<String, String> emailResult = emailService.sendPasswordResetEmail(user.getEmail(), token);
            if (emailResult.get("message").startsWith("Failed")) {
                logger.warn("Failed to send password reset email to {}: {}", user.getEmail(), emailResult.get("message"));
                return emailResult; // Propagate email failure
            }
            return Map.of("message", "Password reset email sent to: " + user.getEmail());
        } catch (DataAccessException e) {
            logger.error("Database error while creating password reset token for {}: {}", emailOrPhone, e.getMessage());
            return Map.of("message", "Failed to process password reset request due to database error");
        }
    }

    @Transactional
    public Map<String, String> resetPassword(String token, String newPassword) {
        try {
            PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                    .orElse(null);
            if (resetToken == null) {
                logger.warn("Invalid password reset token: {}", token);
                return Map.of("message", "Invalid reset token");
            }

            if (resetToken.isExpired() || resetToken.isUsed()) {
                logger.warn("Token is expired or already used: {}", token);
                return Map.of("message", "Token is expired or already used");
            }

            User user = resetToken.getUser();
            user.setPassword(passwordEncoder.encode(newPassword));
            resetToken.setUsed(true);
            userRepo.save(user);
            passwordResetTokenRepository.save(resetToken);
            logger.info("Password reset successfully for user: {}", user.getEmail());
            return Map.of("message", "Password reset successfully");
        } catch (DataAccessException e) {
            logger.error("Database error while resetting password: {}", e.getMessage());
            return Map.of("message", "Failed to reset password due to database error");
        }
    }

    private Map<String, String> sendAdminResetRequest(User user) {
        return emailService.sendAdminResetRequest(user.getEmail(), user.getUsername());
    }
}