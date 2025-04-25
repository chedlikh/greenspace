package com.example.app.Service;

import com.example.app.Entities.Media;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface IMediaService {
    Media saveMedia(Media media);
    Media uploadMedia(MultipartFile file, Long publicationId, String caption, Integer displayOrder) throws IOException;
    Media updateMedia(Long id, Media media);
    void deleteMedia(Long id) throws IOException;
    Optional<Media> findById(Long id);
    List<Media> findAll();
    List<Media> findByPublicationId(Long publicationId);
    List<Media> findByMediaType(Media.MediaType mediaType);
    String determineMediaType(String contentType, String originalFilename);
}