package com.example.app.Mappers;

import com.example.app.DTOs.MediaDTO;
import com.example.app.Entities.Media;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MediaMapper {

    public MediaDTO toDto(Media media) {
        if (media == null) {
            return null;
        }

        // Generate the file download URL like you do in your controller
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/media/files/")
                .path(media.getStoredFileName())
                .toUriString();

        MediaDTO dto = new MediaDTO();
        dto.setId(media.getId());
        dto.setMediaType(media.getMediaType().toString());
        dto.setFileName(media.getFileName());
        dto.setFileUrl(fileDownloadUri); // This is the generated URL
        dto.setCaption(media.getCaption());
        dto.setDisplayOrder(media.getDisplayOrder());
        dto.setThumbnailUrl(media.getThumbnailURL());
        dto.setUploadDate(media.getUploadDate());

        return dto;
    }

    public List<MediaDTO> toDtoList(List<Media> mediaList) {
        if (mediaList == null) {
            return null;
        }

        return mediaList.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // If you need to convert from DTO to Entity
    public Media toEntity(MediaDTO dto) {
        if (dto == null) {
            return null;
        }

        Media media = new Media();
        media.setId(dto.getId());
        media.setMediaType(Media.MediaType.valueOf(dto.getMediaType()));
        media.setFileName(dto.getFileName());
        // Note: fileUrl is not stored in the entity, it's generated when needed
        media.setCaption(dto.getCaption());
        media.setDisplayOrder(dto.getDisplayOrder());
        media.setThumbnailURL(dto.getThumbnailUrl());
        media.setUploadDate(dto.getUploadDate());

        return media;
    }
}