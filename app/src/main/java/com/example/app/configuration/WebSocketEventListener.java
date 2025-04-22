package com.example.app.configuration;

import com.example.app.Repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketEventListener {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketEventListener.class);

    private final UserRepo userRepo;

    @Autowired
    public WebSocketEventListener(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Object authentication = headerAccessor.getUser();

        if (authentication instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) authentication;
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String username = userDetails.getUsername();

            logger.info("User connected to WebSocket: {}", username);

            // You could update user's online status here if needed
            userRepo.findByUsername(username).ifPresent(user -> {
                user.setConnect(true);
                userRepo.save(user);
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Object authentication = headerAccessor.getUser();

        if (authentication instanceof UsernamePasswordAuthenticationToken) {
            UsernamePasswordAuthenticationToken auth = (UsernamePasswordAuthenticationToken) authentication;
            UserDetails userDetails = (UserDetails) auth.getPrincipal();
            String username = userDetails.getUsername();

            logger.info("User disconnected from WebSocket: {}", username);

            // Update user's online status
            userRepo.findByUsername(username).ifPresent(user -> {
                user.setConnect(false);
                userRepo.save(user);
            });
        }
    }
}