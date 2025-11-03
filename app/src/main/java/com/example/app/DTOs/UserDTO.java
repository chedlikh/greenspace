package com.example.app.DTOs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data

public class UserDTO {
    private Long id;
    private String username;
    private String photoProfile;
    private String firstname;
    private String lastName;



    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPhotoProfile() {
        return photoProfile;
    }

    public void setPhotoProfile(String photoProfile) {
        this.photoProfile = photoProfile;
    }

    public String getFirstname() {
        return firstname;
    }

    public void setFirstname(String firstname) {
        this.firstname = firstname;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public UserDTO() {
    }
    public UserDTO(Long id) {
        this.id = id;
    }
    public UserDTO(Long userId, String firstname, String lastName) {
        this.id = userId;         // Initialize id
        this.firstname = firstname;
        this.lastName = lastName;
    }

    public UserDTO(Long id, String username, String photoProfile, String firstname, String lastName) {
        this.id = id;
        this.username = username;
        this.photoProfile = photoProfile;
        this.firstname = firstname;
        this.lastName = lastName;
    }
}