package com.example.app.DTOs;

import com.example.app.Entities.MessageAttachment;
import lombok.Data;

@Data
public class MessageAttachmentDTO {
    private Long id;
    private String fileName;
    private String originalName;
    private String filePath;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public MessageAttachment.AttachmentType getType() {
        return type;
    }

    public void setType(MessageAttachment.AttachmentType type) {
        this.type = type;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getThumbnailPath() {
        return thumbnailPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    private Long fileSize;
    private String mimeType;
    private MessageAttachment.AttachmentType type;
    private Integer duration;
    private String thumbnailPath;

    public MessageAttachmentDTO(Long id, String fileName, String originalName, String filePath, Long fileSize, String mimeType, MessageAttachment.AttachmentType type, Integer duration, String thumbnailPath) {
        this.id = id;
        this.fileName = fileName;
        this.originalName = originalName;
        this.filePath = filePath;
        this.fileSize = fileSize;
        this.mimeType = mimeType;
        this.type = type;
        this.duration = duration;
        this.thumbnailPath = thumbnailPath;
    }

    public MessageAttachmentDTO() {
    }
}
