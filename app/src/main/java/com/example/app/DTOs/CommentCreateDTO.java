package com.example.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

@NoArgsConstructor
public class CommentCreateDTO {
    private String content;
    private Long publicationId;
    private Long parentCommentId;

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Long getPublicationId() {
        return publicationId;
    }

    public void setPublicationId(Long publicationId) {
        this.publicationId = publicationId;
    }

    public Long getParentCommentId() {
        return parentCommentId;
    }

    public void setParentCommentId(Long parentCommentId) {
        this.parentCommentId = parentCommentId;
    }

    public CommentCreateDTO(String content, Long publicationId, Long parentCommentId) {
        this.content = content;
        this.publicationId = publicationId;
        this.parentCommentId = parentCommentId;
    }
}
