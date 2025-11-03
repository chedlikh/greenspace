package com.example.app.Service;

import com.example.app.DTOs.MessageAttachmentDTO;
import com.example.app.Entities.MessageAttachment;
import com.example.app.Repository.MessageAttachmentRepository;
import com.example.app.Repository.MessageRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadServiceImpl implements FileUploadService {

    @Autowired
    private MessageAttachmentRepository attachmentRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private FileValidator fileValidator; // Replace ChatValidationService with FileValidator

    private final String uploadDir = "uploads/";

    @Override
    public MessageAttachmentDTO uploadChatImage(MultipartFile file, Long messageId) throws IOException {
        fileValidator.validateImageFile(file);
        String filePath = uploadChatFile(file, messageId, MessageAttachment.AttachmentType.IMAGE);
        MessageAttachment attachment = attachmentRepository.findByFilePath(filePath)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        return modelMapper.map(attachment, MessageAttachmentDTO.class);
    }

    @Override
    public MessageAttachmentDTO uploadChatVoice(MultipartFile file, Long messageId) throws IOException {
        fileValidator.validateAudioFile(file);
        String filePath = uploadChatFile(file, messageId, MessageAttachment.AttachmentType.VOICE);
        MessageAttachment attachment = attachmentRepository.findByFilePath(filePath)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        return modelMapper.map(attachment, MessageAttachmentDTO.class);
    }

    @Override
    public MessageAttachmentDTO uploadChatVideo(MultipartFile file, Long messageId) throws IOException {
        fileValidator.validateVideoFile(file);
        String filePath = uploadChatFile(file, messageId, MessageAttachment.AttachmentType.VIDEO);
        MessageAttachment attachment = attachmentRepository.findByFilePath(filePath)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        return modelMapper.map(attachment, MessageAttachmentDTO.class);
    }

    @Override
    public MessageAttachmentDTO uploadChatDocument(MultipartFile file, Long messageId) throws IOException {
        fileValidator.validateDocumentFile(file);
        String filePath = uploadChatFile(file, messageId, MessageAttachment.AttachmentType.DOCUMENT);
        MessageAttachment attachment = attachmentRepository.findByFilePath(filePath)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        return modelMapper.map(attachment, MessageAttachmentDTO.class);
    }

    @Override
    public String uploadChatFile(MultipartFile file, Long messageId, MessageAttachment.AttachmentType type) throws IOException {
        fileValidator.validateFileSize(file);
        String fileName = generateFileName(file.getOriginalFilename(), type.name().toLowerCase());
        String filePath = uploadDir + fileName;
        ensureDirectoryExists(uploadDir);

        file.transferTo(new File(filePath));

        MessageAttachment attachment = new MessageAttachment();
        attachment.setMessage(messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found")));
        attachment.setFileName(fileName);
        attachment.setOriginalName(file.getOriginalFilename());
        attachment.setFilePath(filePath);
        attachment.setFileSize(file.getSize());
        attachment.setMimeType(file.getContentType());
        attachment.setType(type);
        attachment.setThumbnailPath(generateThumbnail(filePath));
        attachmentRepository.save(attachment);

        return filePath;
    }

    @Override
    public String uploadGroupImage(MultipartFile file, Long conversationId) throws IOException {
        fileValidator.validateImageFile(file);
        String fileName = generateFileName(file.getOriginalFilename(), "group_image");
        String filePath = uploadDir + fileName;
        ensureDirectoryExists(uploadDir);

        file.transferTo(new File(filePath));
        return filePath;
    }

    @Override
    public boolean isValidImageFile(MultipartFile file) {
        return fileValidator.validateImageFile(file);
    }

    @Override
    public boolean isValidVideoFile(MultipartFile file) {
        return fileValidator.validateVideoFile(file);
    }

    @Override
    public boolean isValidAudioFile(MultipartFile file) {
        return fileValidator.validateAudioFile(file);
    }

    @Override
    public boolean isValidDocumentFile(MultipartFile file) {
        return fileValidator.validateDocumentFile(file);
    }

    @Override
    public boolean isFileSizeValid(MultipartFile file, long maxSizeInBytes) {
        return fileValidator.validateFileSize(file);
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Files.deleteIfExists(Paths.get(filePath));
        } catch (IOException e) {
            throw new RuntimeException("Failed to delete file: " + filePath, e);
        }
    }

    @Override
    public String generateFileName(String originalName, String extension) {
        return UUID.randomUUID().toString() + "." + extension;
    }

    @Override
    public String generateThumbnail(String filePath) throws IOException {
        return filePath + "_thumb.jpg";
    }

    @Override
    public byte[] getFileBytes(String filePath) throws IOException {
        return Files.readAllBytes(Paths.get(filePath));
    }

    @Override
    public String getFileUrl(String filePath) {
        return "/files/" + filePath.replace(uploadDir, "");
    }

    @Override
    public void ensureDirectoryExists(String directoryPath) {
        File dir = new File(directoryPath);
        if (!dir.exists()) {
            dir.mkdirs();
        }
    }

    @Override
    public List<String> getAllowedImageExtensions() {
        return Arrays.asList("jpg", "jpeg", "png", "gif");
    }

    @Override
    public List<String> getAllowedVideoExtensions() {
        return Arrays.asList("mp4", "avi", "mov");
    }

    @Override
    public List<String> getAllowedAudioExtensions() {
        return Arrays.asList("mp3", "wav", "ogg");
    }

    @Override
    public List<String> getAllowedDocumentExtensions() {
        return Arrays.asList("pdf", "doc", "docx", "txt");
    }

    private String getFileExtension(String fileName) {
        return fileName != null && fileName.contains(".")
                ? fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase()
                : "";
    }
}