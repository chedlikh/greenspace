package com.example.app.DTOs;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GroupMemberSettingsDTO {
    private Long userId;
    private boolean canPost;
    private boolean canComment;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isCanPost() {
        return canPost;
    }

    public void setCanPost(boolean canPost) {
        this.canPost = canPost;
    }

    public boolean isCanComment() {
        return canComment;
    }

    public void setCanComment(boolean canComment) {
        this.canComment = canComment;
    }
}