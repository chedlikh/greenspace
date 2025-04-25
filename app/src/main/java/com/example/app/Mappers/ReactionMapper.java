package com.example.app.Mappers;

import com.example.app.DTOs.ReactionDTO;
import com.example.app.Entities.Reaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// ReactionMapper.java
@Service
public class ReactionMapper {

    @Autowired
    private UserMapper userMapper;

    public ReactionDTO toDto(Reaction reaction) {
        ReactionDTO dto = new ReactionDTO();
        dto.setId(reaction.getId());
        dto.setReactionType(reaction.getReactionType());
        dto.setCreateDate(reaction.getCreateDate());

        if (reaction.getUser() != null) {
            dto.setUser(userMapper.toDto(reaction.getUser()));
        }

        return dto;
    }

    public Map<Reaction.ReactionType, Long> countReactions(List<Reaction> reactions) {
        return reactions.stream()
                .collect(Collectors.groupingBy(Reaction::getReactionType, Collectors.counting()));
    }
}
