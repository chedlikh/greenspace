package com.example.app.DTOs;

import com.example.app.Entities.Reaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data

public class ReactionDTO {
    private Long id;
    private Reaction.ReactionType reactionType;
    private LocalDateTime createDate;
    private UserDTO user;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Reaction.ReactionType getReactionType() {
        return reactionType;
    }

    public void setReactionType(Reaction.ReactionType reactionType) {
        this.reactionType = reactionType;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public ReactionDTO() {
    }

    public ReactionDTO(Long id, Reaction.ReactionType reactionType, LocalDateTime createDate, UserDTO user) {
        this.id = id;
        this.reactionType = reactionType;
        this.createDate = createDate;
        this.user = user;
    }

}
