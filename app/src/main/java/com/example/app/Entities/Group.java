package com.example.app.Entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Group {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "description")
    @Lob
    private String description;

    @Enumerated(EnumType.STRING)
    private PrivacyLevel privacyLevel;

    private LocalDateTime createDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_id")
    private User admin;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "group_members",
            joinColumns = @JoinColumn(name = "group_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> members = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Publication> publications = new ArrayList<>();

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMembershipRequest> membershipRequests = new ArrayList<>();

    @Column(name = "profile_photo_url")
    private String profilePhotoUrl;

    @Column(name = "cover_photo_url")
    private String coverPhotoUrl;

    @PrePersist
    protected void onCreate() {
        this.createDate = LocalDateTime.now();
    }

    public enum PrivacyLevel {
        PUBLIC, PRIVATE, SECRET
    }
    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<GroupMemberSettings> memberSettings = new ArrayList<>();

    public void addMember(User user) {
        if (!members.contains(user)) {
            members.add(user);
            GroupMemberSettings settings = new GroupMemberSettings();
            settings.setGroup(this);
            settings.setUser(user);
            settings.setJoinDate(LocalDateTime.now());
            memberSettings.add(settings);
        }
    }

    public void removeMember(User user) {
        members.remove(user);
        memberSettings.removeIf(settings -> settings.getUser().equals(user));
    }

    public void addPublication(Publication publication) {
        publications.add(publication);
        publication.setGroup(this);
    }

    public void addMembershipRequest(GroupMembershipRequest request) {
        membershipRequests.add(request);
        request.setGroup(this);
    }

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

    public PrivacyLevel getPrivacyLevel() {
        return privacyLevel;
    }

    public void setPrivacyLevel(PrivacyLevel privacyLevel) {
        this.privacyLevel = privacyLevel;
    }

    public LocalDateTime getCreateDate() {
        return createDate;
    }

    public void setCreateDate(LocalDateTime createDate) {
        this.createDate = createDate;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public List<User> getMembers() {
        return members;
    }

    public void setMembers(List<User> members) {
        this.members = members;
    }

    public List<Publication> getPublications() {
        return publications;
    }

    public void setPublications(List<Publication> publications) {
        this.publications = publications;
    }

    public List<GroupMembershipRequest> getMembershipRequests() {
        return membershipRequests;
    }

    public void setMembershipRequests(List<GroupMembershipRequest> membershipRequests) {
        this.membershipRequests = membershipRequests;
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

    public List<GroupMemberSettings> getMemberSettings() {
        return memberSettings;
    }

    public void setMemberSettings(List<GroupMemberSettings> memberSettings) {
        this.memberSettings = memberSettings;
    }
}