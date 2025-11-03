package com.example.app.Mappers;

import com.example.app.DTOs.CallParticipantDTO;
import com.example.app.Entities.CallParticipant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CallParticipantMapper {

    @Autowired
    private UserMapper userMapper;

    public CallParticipantDTO toDto(CallParticipant participant) {
        CallParticipantDTO dto = new CallParticipantDTO();
        dto.setId(participant.getId());
        dto.setStatus(participant.getStatus());
        dto.setJoinedDate(participant.getJoinedDate());
        dto.setLeftDate(participant.getLeftDate());
        dto.setAudioEnabled(participant.getAudioEnabled());
        dto.setVideoEnabled(participant.getVideoEnabled());

        if (participant.getUser() != null) {
            dto.setUser(userMapper.toDto(participant.getUser()));
        }

        return dto;
    }
}