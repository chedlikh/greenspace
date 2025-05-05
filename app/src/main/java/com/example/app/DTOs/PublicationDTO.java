package com.example.app.DTOs;

import com.example.app.Entities.Reaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicationDTO {
    private Long id;
    private String content;
    private LocalDateTime createDate;
    private String privacyLevel;
    private String location;
    private String feeling;
    private Boolean isEdited;
    private Integer viewCount;
    private UserDTO user;
    private List<CommentDTO> comments;
    private List<MediaDTO> mediaItems;
    private Map<Reaction.ReactionType, Long> reactionCounts;
    private UserDTO targetUser;
    private GroupDTO group;

    public Boolean getEdited() {
        return isEdited;
    }

    public void setEdited(Boolean edited) {
        isEdited = edited;
    }

    public GroupDTO getGroup() {
        return group;
    }

    public void setGroup(GroupDTO group) {
        this.group = group;
    }

    public UserDTO getTargetUser() {
        return targetUser;
    }

    public void setTargetUser(UserDTO targetUser) {
        this.targetUser = targetUser;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public String getPrivacyLevel() {
        return privacyLevel;
    }

    public void setPrivacyLevel(String privacyLevel) {
        this.privacyLevel = privacyLevel;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getFeeling() {
        return feeling;
    }

    public void setFeeling(String feeling) {
        this.feeling = feeling;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean edited) {
        isEdited = edited;
    }

    public Integer getViewCount() {
        return viewCount;
    }

    public void setViewCount(Integer viewCount) {
        this.viewCount = viewCount;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public List<CommentDTO> getComments() {
        return comments;
    }

    public void setComments(List<CommentDTO> comments) {
        this.comments = comments;
    }

    public List<MediaDTO> getMediaItems() {
        return mediaItems;
    }

    public void setMediaItems(List<MediaDTO> mediaItems) {
        this.mediaItems = mediaItems;
    }

    public Map<Reaction.ReactionType, Long> getReactionCounts() {
        return reactionCounts;
    }

    public void setReactionCounts(Map<Reaction.ReactionType, Long> reactionCounts) {
        this.reactionCounts = reactionCounts;
    }


}
