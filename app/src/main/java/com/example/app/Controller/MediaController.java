package com.example.app.Controller;

import com.example.app.DTOs.MediaDTO;
import com.example.app.DTOs.MediaUpdateDTO;
import com.example.app.DTOs.MediaUploadResponseDTO;
import com.example.app.Entities.Media;
import com.example.app.Entities.Publication;
import com.example.app.Entities.User;
import com.example.app.Service.IMediaService;
import com.example.app.Service.IPublicationService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    @Autowired
    private IMediaService mediaService;

    @Autowired
    private IPublicationService publicationService;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @PostMapping("/upload/publication/{publicationId}")
    public ResponseEntity<?> uploadMediaToPublication(
            @PathVariable Long publicationId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            Publication publication = publicationService.findById(publicationId)
                    .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

            // Check if current user is the owner of the publication
            if (!publication.getUser().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>("You don't have permission to add media to this publication", HttpStatus.FORBIDDEN);
            }

            Media uploadedMedia = mediaService.uploadMedia(file, publicationId, caption, displayOrder);

            // Build the media access URL
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/media/files/")
                    .path(uploadedMedia.getStoredFileName())
                    .toUriString();

            // Create a response DTO with the file information
            MediaUploadResponseDTO response = new MediaUploadResponseDTO(
                    uploadedMedia.getId(),
                    uploadedMedia.getFileName(),
                    fileDownloadUri,
                    uploadedMedia.getFileExtension(),
                    uploadedMedia.getFileSize(),
                    uploadedMedia.getMediaType().toString(),
                    uploadedMedia.getCaption(),
                    uploadedMedia.getThumbnailURL());

            return new ResponseEntity<>(response, HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>("Failed to upload media: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/files/{fileName:.+}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                // Try to determine file's content type
                String contentType = null;
                try {
                    contentType = Files.probeContentType(filePath);
                } catch (IOException ex) {
                    // Default content type if detection fails
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/publication/{publicationId}")
    public ResponseEntity<List<MediaDTO>> getMediaByPublicationId(@PathVariable Long publicationId) {
        List<Media> mediaList = mediaService.findByPublicationId(publicationId);

        List<MediaDTO> mediaDTOs = mediaList.stream().map(media -> {
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/media/files/")
                    .path(media.getStoredFileName())
                    .toUriString();

            return new MediaDTO(
                    media.getId(),
                    media.getMediaType().toString(),
                    media.getFileName(),
                    fileDownloadUri,
                    media.getCaption(),
                    media.getDisplayOrder(),
                    media.getThumbnailURL(),
                    media.getUploadDate());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(mediaDTOs);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMedia(
            @PathVariable Long id,
            @RequestBody MediaUpdateDTO mediaDetails) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            Media existingMedia = mediaService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));

            // Check if current user is the owner of the publication that contains this media
            if (!existingMedia.getPublication().getUser().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>("You don't have permission to update this media", HttpStatus.FORBIDDEN);
            }

            Media mediaToUpdate = new Media();
            mediaToUpdate.setCaption(mediaDetails.getCaption());
            mediaToUpdate.setDisplayOrder(mediaDetails.getDisplayOrder());

            Media updatedMedia = mediaService.updateMedia(id, mediaToUpdate);

            // Create a response DTO with the file information
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/media/files/")
                    .path(updatedMedia.getStoredFileName())
                    .toUriString();

            MediaDTO response = new MediaDTO(
                    updatedMedia.getId(),
                    updatedMedia.getMediaType().toString(),
                    updatedMedia.getFileName(),
                    fileDownloadUri,
                    updatedMedia.getCaption(),
                    updatedMedia.getDisplayOrder(),
                    updatedMedia.getThumbnailURL(),
                    updatedMedia.getUploadDate());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return new ResponseEntity<>("Failed to update media: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMedia(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            Media existingMedia = mediaService.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));

            // Check if current user is the owner of the publication that contains this media
            if (!existingMedia.getPublication().getUser().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>("You don't have permission to delete this media", HttpStatus.FORBIDDEN);
            }

            mediaService.deleteMedia(id);
            return new ResponseEntity<>("Media deleted successfully", HttpStatus.NO_CONTENT);

        } catch (IOException e) {
            return new ResponseEntity<>("Failed to delete media: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/type/{mediaType}")
    public ResponseEntity<List<MediaDTO>> getMediaByType(
            @PathVariable Media.MediaType mediaType) {

        List<Media> mediaList = mediaService.findByMediaType(mediaType);

        List<MediaDTO> mediaDTOs = mediaList.stream().map(media -> {
            String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/media/files/")
                    .path(media.getStoredFileName())
                    .toUriString();

            return new MediaDTO(
                    media.getId(),
                    media.getMediaType().toString(),
                    media.getFileName(),
                    fileDownloadUri,
                    media.getCaption(),
                    media.getDisplayOrder(),
                    media.getThumbnailURL(),
                    media.getUploadDate());
        }).collect(Collectors.toList());

        return ResponseEntity.ok(mediaDTOs);
    }

    // Upload multiple files to a publication
    @PostMapping("/upload/multiple/publication/{publicationId}")
    public ResponseEntity<?> uploadMultipleMediaToPublication(
            @PathVariable Long publicationId,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "captions", required = false) String[] captions) {

        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            User currentUser = (User) authentication.getPrincipal();

            Publication publication = publicationService.findById(publicationId)
                    .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + publicationId));

            // Check if current user is the owner of the publication
            if (!publication.getUser().getId().equals(currentUser.getId())) {
                return new ResponseEntity<>("You don't have permission to add media to this publication", HttpStatus.FORBIDDEN);
            }

            List<MediaUploadResponseDTO> responses = new java.util.ArrayList<>();

            for (int i = 0; i < files.length; i++) {
                String caption = (captions != null && i < captions.length) ? captions[i] : null;
                Media uploadedMedia = mediaService.uploadMedia(files[i], publicationId, caption, i);

                String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/media/files/")
                        .path(uploadedMedia.getStoredFileName())
                        .toUriString();

                responses.add(new MediaUploadResponseDTO(
                        uploadedMedia.getId(),
                        uploadedMedia.getFileName(),
                        fileDownloadUri,
                        uploadedMedia.getFileExtension(),
                        uploadedMedia.getFileSize(),
                        uploadedMedia.getMediaType().toString(),
                        uploadedMedia.getCaption(),
                        uploadedMedia.getThumbnailURL()));
            }

            return new ResponseEntity<>(responses, HttpStatus.CREATED);

        } catch (IOException e) {
            return new ResponseEntity<>("Failed to upload media: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}