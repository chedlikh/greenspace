package com.example.app.Mappers;

import com.example.app.DTOs.PublicationCreateDTO;
import com.example.app.DTOs.PublicationDTO;
import com.example.app.DTOs.UserDTO;
import com.example.app.Entities.Publication;
import com.example.app.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class PublicationMapper {

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private MediaMapper mediaMapper;

    @Autowired
    private ReactionMapper reactionMapper;

    public PublicationDTO toDto(Publication publication) {
        PublicationDTO dto = new PublicationDTO();
        dto.setId(publication.getId());
        dto.setContent(publication.getContent());
        dto.setCreateDate(publication.getCreateDate());
        dto.setPrivacyLevel(publication.getPrivacyLevel().toString());
        dto.setLocation(publication.getLocation());
        dto.setFeeling(publication.getFeeling());
        dto.setIsEdited(publication.getIsEdited());
        dto.setViewCount(publication.getViewCount());

        if (publication.getUser() != null) {
            dto.setUser(mapUserToDto(publication.getUser()));
        }

        if (publication.getComments() != null) {
            dto.setComments(publication.getComments().stream()
                    .map(commentMapper::toDto)
                    .collect(Collectors.toList()));
        }

        if (publication.getMediaItems() != null) {
            dto.setMediaItems(publication.getMediaItems().stream()
                    .map(mediaMapper::toDto)
                    .collect(Collectors.toList()));
        }

        if (publication.getReactions() != null) {
            dto.setReactionCounts(reactionMapper.countReactions(publication.getReactions()));
        }

        return dto;
    }

    private UserDTO mapUserToDto(User user) {
        UserDTO userDto = new UserDTO();
        userDto.setId(user.getId());
        userDto.setUsername(user.getUsername());
        userDto.setPhotoProfile(user.getPhotoProfile());
        userDto.setFirstname(user.getFirstname());
        userDto.setLastName(user.getLastName());
        return userDto;
    }

    public Publication toEntity(PublicationCreateDTO dto) {
        Publication publication = new Publication();
        publication.setContent(dto.getContent());
        publication.setPrivacyLevel(dto.getPrivacyLevel());
        publication.setLocation(dto.getLocation());
        publication.setFeeling(dto.getFeeling());
        return publication;
    }
}
