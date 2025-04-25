package com.example.app.Service;

import com.example.app.Entities.Media;
import com.example.app.Entities.Publication;
import com.example.app.Repository.MediaRepository;
import com.example.app.Repository.PublicationRepository;
import com.example.app.Service.IMediaService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MediaServiceImpl implements IMediaService {

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public Media saveMedia(Media media) {
        return mediaRepository.save(media);
    }

    @Override
    public Media uploadMedia(MultipartFile file, Long publicationId, String caption, Integer displayOrder) throws IOException {
        Publication publication = publicationRepository.findById(publicationId)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

        // Create upload directory if it doesn't exist
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // Generate a unique filename to prevent collisions
        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String storedFileName = UUID.randomUUID().toString() + fileExtension;

        // Save the file to the upload directory
        Path filePath = Paths.get(uploadDir, storedFileName);
        Files.write(filePath, file.getBytes());

        // Create and save the media entity
        Media media = new Media();
        media.setPublication(publication);
        media.setFileName(originalFilename);
        media.setStoredFileName(storedFileName);
        media.setFilePath(filePath.toString());
        media.setFileExtension(fileExtension);
        media.setFileSize(file.getSize());
        media.setCaption(caption);
        media.setDisplayOrder(displayOrder != null ? displayOrder : 0);

        // Determine media type based on content type
        String contentType = file.getContentType();
        String mediaType = determineMediaType(contentType, originalFilename);
        media.setMediaType(Media.MediaType.valueOf(mediaType));

        // Generate thumbnail for videos (simplified - in real app, would use a media processing library)
        if (media.getMediaType() == Media.MediaType.VIDEO) {
            media.setThumbnailURL("/thumbnails/" + storedFileName.replace(fileExtension, ".jpg"));
        }

        return mediaRepository.save(media);
    }

    @Override
    public Media updateMedia(Long id, Media mediaDetails) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));

        media.setCaption(mediaDetails.getCaption());
        media.setDisplayOrder(mediaDetails.getDisplayOrder());

        return mediaRepository.save(media);
    }

    @Override
    public void deleteMedia(Long id) throws IOException {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));

        // Delete the file from filesystem
        Path filePath = Paths.get(media.getFilePath());
        Files.deleteIfExists(filePath);

        // If there's a thumbnail, delete it too
        if (media.getThumbnailURL() != null && !media.getThumbnailURL().isEmpty()) {
            Path thumbnailPath = Paths.get(uploadDir, media.getThumbnailURL().substring(media.getThumbnailURL().lastIndexOf("/") + 1));
            Files.deleteIfExists(thumbnailPath);
        }

        mediaRepository.deleteById(id);
    }

    @Override
    public Optional<Media> findById(Long id) {
        return mediaRepository.findById(id);
    }

    @Override
    public List<Media> findAll() {
        return mediaRepository.findAll();
    }

    @Override
    public List<Media> findByPublicationId(Long publicationId) {
        return mediaRepository.findByPublicationIdOrderByDisplayOrderAsc(publicationId);
    }

    @Override
    public List<Media> findByMediaType(Media.MediaType mediaType) {
        return mediaRepository.findByMediaType(mediaType);
    }

    @Override
    public String determineMediaType(String contentType, String originalFilename) {
        if (contentType != null) {
            if (contentType.startsWith("image/")) {
                return "IMAGE";
            } else if (contentType.startsWith("video/")) {
                return "VIDEO";
            } else if (contentType.startsWith("audio/")) {
                return "AUDIO";
            }
        }

        // Fallback to file extension check if content type doesn't help
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();

        if (extension.matches("jpg|jpeg|png|gif|bmp|svg|webp")) {
            return "IMAGE";
        } else if (extension.matches("mp4|avi|mov|wmv|flv|mkv|webm")) {
            return "VIDEO";
        } else if (extension.matches("mp3|wav|ogg|aac|wma|flac")) {
            return "AUDIO";
        }

        // Default to document for other types
        return "DOCUMENT";
    }
}