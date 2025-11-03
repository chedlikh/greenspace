package com.example.app.Mappers;

import com.example.app.DTOs.NotificationDTO;
import com.example.app.Entities.Notification;
import com.example.app.Entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class NotificationMapper {

    @Autowired
    private UserMapper userMapper;

    public NotificationDTO toDto(Notification notification) {
        if (notification == null) {
            return null;
        }

        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setUserId(notification.getUser() != null ? notification.getUser().getId() : null);
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setContent(notification.getContent());
        dto.setMetadata(notification.getMetadataMap());
        dto.setCreatedDate(notification.getCreatedDate());
        dto.setRead(notification.isRead());

        return dto;
    }

    public Notification toEntity(NotificationDTO dto, User user) {
        if (dto == null) {
            return null;
        }

        Notification notification = new Notification();
        notification.setId(dto.getId());
        notification.setUser(user);
        notification.setType(dto.getType());
        notification.setTitle(dto.getTitle());
        notification.setContent(dto.getContent());
        notification.setMetadataMap(dto.getMetadata());
        notification.setCreatedDate(dto.getCreatedDate() != null ? dto.getCreatedDate() : java.time.LocalDateTime.now());
        notification.setRead(dto.isRead());

        // Set conversationId and callId from metadata if present
        Map<String, Object> metadata = dto.getMetadata();
        if (metadata != null) {
            if (metadata.containsKey("conversationId")) {
                notification.setConversationId(metadata.get("conversationId").toString());
            }
            if (metadata.containsKey("callId")) {
                notification.setCallId(metadata.get("callId").toString());
            }
        }

        return notification;
    }
}