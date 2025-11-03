package com.example.app.Service;

import com.example.app.DTOs.MessageAttachmentDTO;
import com.example.app.Entities.MessageAttachment;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface FileUploadService {
    MessageAttachmentDTO uploadChatImage(MultipartFile file, Long messageId) throws IOException;
    MessageAttachmentDTO uploadChatVoice(MultipartFile file, Long messageId) throws IOException;
    MessageAttachmentDTO uploadChatVideo(MultipartFile file, Long messageId) throws IOException;
    MessageAttachmentDTO uploadChatDocument(MultipartFile file, Long messageId) throws IOException;
    String uploadChatFile(MultipartFile file, Long messageId, MessageAttachment.AttachmentType type) throws IOException;
    String uploadGroupImage(MultipartFile file, Long conversationId) throws IOException;
    boolean isValidImageFile(MultipartFile file);
    boolean isValidVideoFile(MultipartFile file);
    boolean isValidAudioFile(MultipartFile file);
    boolean isValidDocumentFile(MultipartFile file);
    boolean isFileSizeValid(MultipartFile file, long maxSizeInBytes);
    void deleteFile(String filePath);
    String generateFileName(String originalName, String extension);
    String generateThumbnail(String filePath) throws IOException;
    byte[] getFileBytes(String filePath) throws IOException;
    String getFileUrl(String filePath);
    void ensureDirectoryExists(String directoryPath);
    List<String> getAllowedImageExtensions();
    List<String> getAllowedVideoExtensions();
    List<String> getAllowedAudioExtensions();
    List<String> getAllowedDocumentExtensions();
}