package com.example.app.configuration;

import com.example.app.Filter.WebSocketAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable a simple memory-based message broker to send messages to clients
        // Prefix for messages FROM the server TO the client
        registry.enableSimpleBroker("/topic", "/queue");

        // Prefix for messages FROM the client TO the server
        registry.setApplicationDestinationPrefixes("/app");

        // For user-specific messages
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // The endpoint clients use to connect to our WebSocket server
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .setAllowedOriginPatterns("*")
                .setAllowedOrigins("http://localhost:8089","http://localhost:5173")// For development; restrict in production
                .withSockJS();           // Fallback options for browsers that don't support WebSocket
    }

}