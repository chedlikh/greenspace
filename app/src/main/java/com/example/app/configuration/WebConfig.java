package com.example.app.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Forward all routes to index.html (except API routes)
        registry.addViewController("/{path:[^\\.]*}")
                .setViewName("forward:/index.html");

        // Forward nested routes (e.g., /u/:username)
        registry.addViewController("/{path:[^\\.]*}/{subpath:[^\\.]*}")
                .setViewName("forward:/index.html");

        // Forward deeper nested routes (e.g., /u/:username/details)
        registry.addViewController("/{path:[^\\.]*}/{subpath:[^\\.]*}/{subsubpath:[^\\.]*}")
                .setViewName("forward:/index.html");
    }
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/"); // Serve files from the "uploads" directory
    }
}

