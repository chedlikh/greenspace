package com.example.app.Mappers;

import com.example.app.DTOs.UserDTO;
import com.example.app.DTOs.UserDetailsDTO;
import com.example.app.Entities.User;
import org.springframework.stereotype.Service;

// UserMapper.java
@Service
public class UserMapper {
    public UserDTO toDto(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPhotoProfile(user.getPhotoProfile());
        dto.setFirstname(user.getFirstname());
        dto.setLastName(user.getLastName());
        return dto;
    }

    public UserDetailsDTO toDetailsDto(User user) {
        UserDetailsDTO dto = new UserDetailsDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setPhotoProfile(user.getPhotoProfile());
        dto.setFirstname(user.getFirstname());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setGender(user.getGender());
        dto.setCountry(user.getCountry());
        dto.setBirthday(user.getBirthday());
        return dto;
    }
}
