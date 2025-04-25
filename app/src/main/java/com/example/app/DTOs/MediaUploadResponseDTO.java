package com.example.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

public class MediaUploadResponseDTO {
    private Long id;
    private String fileName;
    private String fileUrl;
    private String fileExtension;
    private Long fileSize;
    private String mediaType;
    private String caption;
    private String thumbnailUrl;

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

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public MediaUploadResponseDTO() {
    }

    public MediaUploadResponseDTO(Long id, String fileName, String fileUrl, String fileExtension, Long fileSize, String mediaType, String caption, String thumbnailUrl) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.fileExtension = fileExtension;
        this.fileSize = fileSize;
        this.mediaType = mediaType;
        this.caption = caption;
        this.thumbnailUrl = thumbnailUrl;
    }
}