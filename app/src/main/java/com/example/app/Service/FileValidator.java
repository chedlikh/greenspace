package com.example.app.Service;

import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Component
public class FileValidator {

    // Maximum file size (100MB)
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

    public boolean validateFile(MultipartFile file) {
        return file != null && !file.isEmpty() && !validateFileForMalware(file);
    }

    public boolean validateFileSize(MultipartFile file) {
        return file.getSize() <= MAX_FILE_SIZE;
    }

    public boolean validateFileType(MultipartFile file, String expectedType) {
        return file.getContentType() != null && file.getContentType().contains(expectedType);
    }

    public boolean validateImageFile(MultipartFile file) {
        return validateFile(file) && isValidImageFile(file) && validateImageContent(file);
    }

    public boolean validateVideoFile(MultipartFile file) {
        return validateFile(file) && isValidVideoFile(file);
    }

    public boolean validateAudioFile(MultipartFile file) {
        return validateFile(file) && isValidAudioFile(file);
    }

    public boolean validateDocumentFile(MultipartFile file) {
        return validateFile(file) && isValidDocumentFile(file);
    }

    private boolean isValidImageFile(MultipartFile file) {
        return getAllowedImageExtensions().contains(getFileExtension(file.getOriginalFilename()));
    }

    private boolean isValidVideoFile(MultipartFile file) {
        return getAllowedVideoExtensions().contains(getFileExtension(file.getOriginalFilename()));
    }

    private boolean isValidAudioFile(MultipartFile file) {
        return getAllowedAudioExtensions().contains(getFileExtension(file.getOriginalFilename()));
    }

    private boolean isValidDocumentFile(MultipartFile file) {
        return getAllowedDocumentExtensions().contains(getFileExtension(file.getOriginalFilename()));
    }

    private boolean validateFileForMalware(MultipartFile file) {
        // Placeholder: Implement malware scanning
        return false;
    }

    private boolean validateImageContent(MultipartFile file) {
        // Placeholder: Implement image content moderation
        return true;
    }

    private List<String> getAllowedImageExtensions() {
        return Arrays.asList("jpg", "jpeg", "png", "gif");
    }

    private List<String> getAllowedVideoExtensions() {
        return Arrays.asList("mp4", "avi", "mov");
    }

    private List<String> getAllowedAudioExtensions() {
        return Arrays.asList("mp3", "wav", "ogg");
    }

    private List<String> getAllowedDocumentExtensions() {
        return Arrays.asList("pdf", "doc", "docx", "txt");
    }

    private String getFileExtension(String fileName) {
        return fileName != null && fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}