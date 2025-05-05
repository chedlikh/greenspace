package com.example.app.DTOs;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class GroupMemberStatsDTO {
    private Long userId;
    private String username;
    private String firstName;
    private String lastName;
    private long publicationCount;
    private long commentCount;
    private long reactionCount;
    private LocalDateTime joinDate;
    private LocalDateTime lastCommentDate;
    private LocalDateTime lastPublicationDate;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public long getPublicationCount() {
        return publicationCount;
    }

    public void setPublicationCount(long publicationCount) {
        this.publicationCount = publicationCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public long getReactionCount() {
        return reactionCount;
    }

    public void setReactionCount(long reactionCount) {
        this.reactionCount = reactionCount;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
    }

    public LocalDateTime getLastCommentDate() {
        return lastCommentDate;
    }

    public void setLastCommentDate(LocalDateTime lastCommentDate) {
        this.lastCommentDate = lastCommentDate;
    }

    public LocalDateTime getLastPublicationDate() {
        return lastPublicationDate;
    }

    public void setLastPublicationDate(LocalDateTime lastPublicationDate) {
        this.lastPublicationDate = lastPublicationDate;
    }
}