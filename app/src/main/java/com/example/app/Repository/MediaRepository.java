package com.example.app.Repository;

import com.example.app.Entities.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {
    List<Media> findByPublicationIdOrderByDisplayOrderAsc(Long publicationId);
    List<Media> findByMediaType(Media.MediaType mediaType);
}
