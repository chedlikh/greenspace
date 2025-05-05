package com.example.app.Entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Entity
@Table(name = "group_member_settings")
@Getter
@Setter
public class GroupMemberSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDateTime joinDate;

    @Column(nullable = false)
    private boolean canPost = false;

    @Column(nullable = false)
    private boolean canComment = false;
    private long publicationCount;

    private long commentCount;

    private long reactionCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Group getGroup() {
        return group;
    }

    public void setGroup(Group group) {
        this.group = group;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getJoinDate() {
        return joinDate;
    }

    public void setJoinDate(LocalDateTime joinDate) {
        this.joinDate = joinDate;
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

    public GroupMemberSettings() {
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

    public GroupMemberSettings(Long id, Group group, User user, LocalDateTime joinDate, boolean canPost, boolean canComment, long publicationCount, long commentCount, long reactionCount) {
        this.id = id;
        this.group = group;
        this.user = user;
        this.joinDate = joinDate;
        this.canPost = canPost;
        this.canComment = canComment;
        this.publicationCount = publicationCount;
        this.commentCount = commentCount;
        this.reactionCount = reactionCount;
    }
}
