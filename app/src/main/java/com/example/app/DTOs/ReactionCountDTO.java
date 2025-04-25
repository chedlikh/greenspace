package com.example.app.DTOs;

import com.example.app.Entities.Reaction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data

public class ReactionCountDTO {
    private Map<Reaction.ReactionType, Long> counts;

    public Map<Reaction.ReactionType, Long> getCounts() {
        return counts;
    }

    public void setCounts(Map<Reaction.ReactionType, Long> counts) {
        this.counts = counts;
    }

    public ReactionCountDTO(Map<Reaction.ReactionType, Long> counts) {
        this.counts = counts;
    }

    public ReactionCountDTO() {
    }
}
