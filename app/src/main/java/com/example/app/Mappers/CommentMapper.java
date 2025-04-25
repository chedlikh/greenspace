package com.example.app.Mappers;

import com.example.app.DTOs.CommentCreateDTO;
import com.example.app.DTOs.CommentDTO;
import com.example.app.Entities.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

// CommentMapper.java
@Service
public class CommentMapper {

    @Autowired
    private UserMapper userMapper;

    public CommentDTO toDto(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreateDate(comment.getCreateDate());
        dto.setIsEdited(comment.getIsEdited());

        if (comment.getUser() != null) {
            dto.setUser(userMapper.toDto(comment.getUser()));
        }

        if (comment.getPublication() != null) {
            dto.setPublicationId(comment.getPublication().getId());
        }

        if (comment.getParentComment() != null) {
            dto.setParentCommentId(comment.getParentComment().getId());
        }

        if (comment.getReplies() != null) {
            dto.setReplies(comment.getReplies().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Comment toEntity(CommentCreateDTO dto) {
        Comment comment = new Comment();
        comment.setContent(dto.getContent());
        return comment;
    }
}
