package com.example.app.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class SFileStorageService {

    private final Path storyUploadLocation;
    private final Path userUploadLocation;

    public SFileStorageService() {
        this.userUploadLocation = Paths.get("uploads");
        this.storyUploadLocation = Paths.get("uploads/story");
        try {
            Files.createDirectories(this.userUploadLocation);
            Files.createDirectories(this.storyUploadLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directories", e);
        }
    }

    public String store(MultipartFile file) {
        return store(file, userUploadLocation);
    }

    public String storeStoryMedia(MultipartFile file) {
        return store(file, storyUploadLocation);
    }

    private String store(MultipartFile file, Path uploadLocation) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file");
            }

            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generate unique filename
            String newFilename = UUID.randomUUID().toString() + fileExtension;

            // Save the file
            Path destinationFile = uploadLocation.resolve(
                    Paths.get(newFilename)).normalize().toAbsolutePath();

            Files.copy(file.getInputStream(), destinationFile);

            return newFilename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }
    }

    public boolean isVideoFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("video/");
    }

    public boolean isImageFile(MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }
}