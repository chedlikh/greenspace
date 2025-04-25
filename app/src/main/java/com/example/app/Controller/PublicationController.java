package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Publication;
import com.example.app.Entities.User;
import com.example.app.Mappers.PublicationMapper;
import com.example.app.Service.IPublicationService;
import com.example.app.Service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    @Autowired
    private IPublicationService publicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private PublicationMapper publicationMapper;

    @PostMapping
    public ResponseEntity<PublicationDTO> createPublication(@RequestBody PublicationCreateDTO publicationDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Publication publication = publicationMapper.toEntity(publicationDto);
        publication.setUser(currentUser);

        Publication savedPublication = publicationService.savePublication(publication);
        return new ResponseEntity<>(publicationMapper.toDto(savedPublication), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<PublicationDTO>> getAllPublications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Publication> publications = publicationService.findAllPaginated(pageable);

        Page<PublicationDTO> dtoPage = publications.map(publicationMapper::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicationDTO> getPublicationById(@PathVariable Long id) {
        return publicationService.findById(id)
                .map(publication -> {
                    publicationService.incrementViewCount(id);
                    return new ResponseEntity<>(publicationMapper.toDto(publication), HttpStatus.OK);
                })
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + id));
    }

    // Changed from userId to username
    @GetMapping("/user/{username}")
    public ResponseEntity<Page<PublicationDTO>> getPublicationsByUsername(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"));

        try {
            // Load user by username - this will already throw UsernameNotFoundException if not found
            User user = (User) userService.loadUserByUsername(username);

            // Then find publications by user ID
            Page<Publication> publications = publicationService.findByUserIdPaginated(user.getId(), pageable);

            Page<PublicationDTO> dtoPage = publications.map(publicationMapper::toDto);
            return ResponseEntity.ok(dtoPage);
        } catch (org.springframework.security.core.userdetails.UsernameNotFoundException e) {
            throw new EntityNotFoundException("User not found with username: " + username);
        }
    }

    @GetMapping("/privacy/{privacyLevel}")
    public ResponseEntity<List<PublicationDTO>> getPublicationsByPrivacyLevel(
            @PathVariable Publication.PrivacyLevel privacyLevel) {

        List<Publication> publications = publicationService.findByPrivacyLevel(privacyLevel);
        List<PublicationDTO> dtos = publications.stream()
                .map(publicationMapper::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublicationDTO> updatePublication(
            @PathVariable Long id,
            @RequestBody PublicationUpdateDTO publicationDetails) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Publication existingPublication = publicationService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + id));

        if (!existingPublication.getUser().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        existingPublication.setContent(publicationDetails.getContent());
        existingPublication.setPrivacyLevel(publicationDetails.getPrivacyLevel());
        existingPublication.setLocation(publicationDetails.getLocation());
        existingPublication.setFeeling(publicationDetails.getFeeling());
        existingPublication.setIsEdited(true);

        Publication updatedPublication = publicationService.updatePublication(id, existingPublication);
        return ResponseEntity.ok(publicationMapper.toDto(updatedPublication));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePublication(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Publication existingPublication = publicationService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Publication not found with id: " + id));

        if (!existingPublication.getUser().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        publicationService.deletePublication(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}