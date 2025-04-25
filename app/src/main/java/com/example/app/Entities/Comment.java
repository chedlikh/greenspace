package com.example.app.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content")
    @Lob
    private String content;


    private LocalDateTime createDate;
    private LocalDateTime updateDate;
    private Boolean isEdited = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "publication_id")
    private Publication publication;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reaction> reactions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createDate = LocalDateTime.now();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public void setUpdateDate(LocalDateTime updateDate) {
        this.updateDate = updateDate;
    }

    public void setIsEdited(Boolean edited) {
        isEdited = edited;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setPublication(Publication publication) {
        this.publication = publication;
    }

    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }

    public void setReplies(List<Comment> replies) {
        this.replies = replies;
    }

    public void setReactions(List<Reaction> reactions) {
        this.reactions = reactions;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public LocalDateTime getUpdateDate() {
        return updateDate;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public User getUser() {
        return user;
    }

    public Publication getPublication() {
        return publication;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    public List<Comment> getReplies() {
        return replies;
    }

    public List<Reaction> getReactions() {
        return reactions;
    }
}