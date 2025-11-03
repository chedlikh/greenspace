package com.example.app.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.util.Map;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${frontend.url}")
    private String frontendUrl;

    public Map<String, String> sendPasswordResetEmail(String email, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(email);
            helper.setSubject("Password Reset Request");
            String resetUrl = frontendUrl + "/reset-password?token=" + token;
            helper.setText(
                    "<h3>Password Reset</h3>" +
                            "<p>Click the link below to reset your password:</p>" +
                            "<a href='" + resetUrl + "'>Reset Password</a>" +
                            "<p>This link will expire in 24 hours.</p>",
                    true
            );
            mailSender.send(message);
            logger.info("Password reset email sent to: {}", email);
            return Map.of("message", "Password reset email sent successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send password reset email to {}: {}", email, e.getMessage());
            return Map.of("message", "Failed to send password reset email: " + e.getMessage());
        }
    }

    public Map<String, String> sendAdminResetRequest(String userEmail, String username) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo("admin@yourdomain.com"); // Replace with actual admin email
            helper.setSubject("Password Reset Request for User");
            helper.setText(
                    "<h3>Password Reset Request</h3>" +
                            "<p>User with email: " + userEmail + " and username: " + username +
                            " has requested a password reset.</p>",
                    true
            );
            mailSender.send(message);
            logger.info("Admin reset request email sent for user: {}", userEmail);
            return Map.of("message", "Admin reset request sent successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send admin reset request email for {}: {}", userEmail, e.getMessage());
            return Map.of("message", "Failed to send admin reset request email: " + e.getMessage());
        }
    }
}