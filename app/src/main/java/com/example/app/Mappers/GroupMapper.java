package com.example.app.Mappers;

import com.example.app.DTOs.GroupCreateDTO;
import com.example.app.DTOs.GroupDTO;
import com.example.app.DTOs.GroupMemberDTO;
import com.example.app.DTOs.GroupMemberSettingsDTO;
import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Entities.User;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class GroupMapper {

    // Map Group entity to GroupDTO
    public GroupDTO toDto(Group group) {
        if (group == null) {
            return null;
        }

        GroupDTO dto = new GroupDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setPrivacyLevel(group.getPrivacyLevel());

        if (group.getAdmin() != null) {
            dto.setAdminId(group.getAdmin().getId());
            dto.setAdminUsername(group.getAdmin().getUsername());
        }

        dto.setProfilePhotoUrl(group.getProfilePhotoUrl());
        dto.setCoverPhotoUrl(group.getCoverPhotoUrl());
        dto.setMembers(mapMembers(group));

        return dto;
    }

    // Map Group members to List<GroupDTO.MemberDTO>
    private List<GroupDTO.MemberDTO> mapMembers(Group group) {
        if (group.getMembers() == null || group.getMembers().isEmpty()) {
            return Collections.emptyList();
        }

        return group.getMembers().stream()
                .map(this::mapToMemberDTO)
                .collect(Collectors.toList());
    }

    // Map User to GroupDTO.MemberDTO
    private GroupDTO.MemberDTO mapToMemberDTO(User user) {
        return new GroupDTO.MemberDTO(
                user.getId(),
                user.getUsername(),
                user.getFirstname(),
                user.getLastName(),
                user.getPhotoProfile()
        );
    }

    // Map GroupCreateDTO to Group entity
    public Group toEntity(GroupCreateDTO dto) {
        if (dto == null) {
            return null;
        }

        Group group = new Group();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setPrivacyLevel(dto.getPrivacyLevel());
        group.setProfilePhotoUrl(dto.getProfilePhotoUrl());
        group.setCoverPhotoUrl(dto.getCoverPhotoUrl());
        return group;
    }

    // Map GroupMemberSettings to GroupMemberDTO
    public GroupMemberDTO toMemberDto(GroupMemberSettings settings) {
        if (settings == null || settings.getUser() == null) {
            return null;
        }

        GroupMemberDTO dto = new GroupMemberDTO();
        dto.setUserId(settings.getUser().getId());
        dto.setUsername(settings.getUser().getUsername());
        dto.setFirstName(settings.getUser().getFirstname());
        dto.setLastName(settings.getUser().getLastName());
        dto.setJoinDate(settings.getJoinDate());
        dto.setCanPost(settings.isCanPost());
        dto.setCanComment(settings.isCanComment());
        // Note: Medal is set in the controller based on sorting
        return dto;
    }

    // Map GroupMemberSettings to GroupMemberSettingsDTO
    public GroupMemberSettingsDTO toSettingsDto(GroupMemberSettings settings) {
        if (settings == null) {
            return null;
        }

        GroupMemberSettingsDTO dto = new GroupMemberSettingsDTO();
        dto.setUserId(settings.getUser().getId());
        dto.setCanPost(settings.isCanPost());
        dto.setCanComment(settings.isCanComment());
        return dto;
    }
}