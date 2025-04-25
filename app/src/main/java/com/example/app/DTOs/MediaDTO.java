package com.example.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data

public class MediaDTO {
    private Long id;
    private String mediaType;
    private String fileName;
    private String fileUrl;
    private String caption;
    private Integer displayOrder;
    private String thumbnailUrl;
    private LocalDateTime uploadDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
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

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public MediaDTO() {
    }

    public MediaDTO(Long id, String mediaType, String fileName, String fileUrl, String caption, Integer displayOrder, String thumbnailUrl, LocalDateTime uploadDate) {
        this.id = id;
        this.mediaType = mediaType;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.caption = caption;
        this.displayOrder = displayOrder;
        this.thumbnailUrl = thumbnailUrl;
        this.uploadDate = uploadDate;
    }


}