package com.example.app.Mappers;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CallMapper {

    @Autowired
    private UserMapper userMapper;
    @Autowired
    private CallParticipantMapper callParticipantMapper;

    public CallDTO toDto(Call call) {
        CallDTO dto = new CallDTO();
        dto.setId(call.getId());
        dto.setType(call.getType());
        dto.setStatus(call.getStatus());
        dto.setStartedDate(call.getStartedDate());
        dto.setEndedDate(call.getEndedDate());
        dto.setDuration(call.getDuration());

        if (call.getConversation() != null) {
            dto.setConversationId(call.getConversation().getId());
        }

        if (call.getInitiatedBy() != null) {
            dto.setInitiatedBy(userMapper.toDto(call.getInitiatedBy()));
        }

        if (call.getParticipants() != null) {
            dto.setParticipants(call.getParticipants().stream()
                    .map(callParticipantMapper::toDto)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public Call toEntity(CallCreateDTO dto, Conversation conversation, User initiatedBy) {
        Call call = new Call();
        call.setType(dto.getType());
        call.setConversation(conversation);
        call.setInitiatedBy(initiatedBy);
        call.setStatus(Call.CallStatus.INITIATED);
        call.setStartedDate(dto.getStartedDate() != null ? dto.getStartedDate() : LocalDateTime.now());
        return call;
    }
}