package com.example.app.DTOs;

import com.example.app.Entities.Group;

import java.util.List;

public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private Group.PrivacyLevel privacyLevel;
    private Long adminId;
    private String adminUsername;
    private String profilePhotoUrl;
    private String coverPhotoUrl;
    private List<MemberDTO> members;

    // No-arg constructor
    public GroupDTO() {
    }

    // Full-arg constructor
    public GroupDTO(Long id, String name, String description, Group.PrivacyLevel privacyLevel,
                    Long adminId, String adminUsername, String profilePhotoUrl, String coverPhotoUrl,
                    List<MemberDTO> members) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.privacyLevel = privacyLevel;
        this.adminId = adminId;
        this.adminUsername = adminUsername;
        this.profilePhotoUrl = profilePhotoUrl;
        this.coverPhotoUrl = coverPhotoUrl;
        this.members = members;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Group.PrivacyLevel getPrivacyLevel() {
        return privacyLevel;
    }

    public void setPrivacyLevel(Group.PrivacyLevel privacyLevel) {
        this.privacyLevel = privacyLevel;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public String getAdminUsername() {
        return adminUsername;
    }

    public void setAdminUsername(String adminUsername) {
        this.adminUsername = adminUsername;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public String getCoverPhotoUrl() {
        return coverPhotoUrl;
    }

    public void setCoverPhotoUrl(String coverPhotoUrl) {
        this.coverPhotoUrl = coverPhotoUrl;
    }

    public List<MemberDTO> getMembers() {
        return members;
    }

    public void setMembers(List<MemberDTO> members) {
        this.members = members;
    }

    public static class MemberDTO {
        private Long id;
        private String username;
        private String firstname;
        private String lastName;
        private String photoProfile;

        // No-arg constructor
        public MemberDTO() {
        }

        // Full-arg constructor
        public MemberDTO(Long id, String username, String firstname, String lastName, String photoProfile) {
            this.id = id;
            this.username = username;
            this.firstname = firstname;
            this.lastName = lastName;
            this.photoProfile = photoProfile;
        }

        // Getters and setters
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

        public String getPhotoProfile() {
            return photoProfile;
        }

        public void setPhotoProfile(String photoProfile) {
            this.photoProfile = photoProfile;
        }
    }
}