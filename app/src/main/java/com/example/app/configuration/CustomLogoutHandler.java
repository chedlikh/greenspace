package com.example.app.configuration;


import com.example.app.Entities.Token;
import com.example.app.Entities.User;
import com.example.app.Repository.TokenRepository;
import com.example.app.Repository.UserRepo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;

@Configuration
public class CustomLogoutHandler implements LogoutHandler {
    private static final Logger log = LoggerFactory.getLogger(CustomLogoutHandler.class);  // Define the logger

    private final TokenRepository tokenRepository;
    private final UserRepo userRepository;

    public CustomLogoutHandler(TokenRepository tokenRepository, UserRepo userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void logout(HttpServletRequest request,
                       HttpServletResponse response,
                       Authentication authentication) {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }

        // Extract the JWT token and log it for debugging
        String token = authHeader.substring(7);
        log.debug("Received JWT Token during logout: {}", token);

        Token storedToken = tokenRepository.findByAccessToken(token).orElse(null);

        if (storedToken != null) {
            storedToken.setLoggedOut(true);  // Mark the token as logged out
            tokenRepository.save(storedToken);  // Save the updated token

            // Additionally, set the 'isConnect' flag to false for the corresponding user
            User user = storedToken.getUser();  // Assuming there's a reference to the User in Token entity
            if (user != null) {
                user.setConnect(false);  // Set the 'isConnect' flag to false
                userRepository.save(user);  // Save the updated user
            }
        }
    }
}
