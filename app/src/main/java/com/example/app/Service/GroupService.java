package com.example.app.Service;

import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Entities.GroupMembershipRequest;
import com.example.app.Entities.User;
import com.example.app.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupService implements IGroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMembershipRequestRepository membershipRequestRepository;

    @Autowired
    private PublicationRepository publicationRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private ReactionRepository reactionRepository;

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public Group saveGroup(Group group) {
        return groupRepository.save(group);
    }

    @Override
    public Optional<Group> findById(Long id) {
        return groupRepository.findById(id);
    }

    @Override
    public Page<Group> findAllPaginated(Pageable pageable) {
        return groupRepository.findAll(pageable);
    }

    @Override
    public Page<Group> findByMemberUsernamePaginated(String username, Pageable pageable) {
        return groupRepository.findByMemberUsername(username, pageable);
    }

    @Override
    public Group updateGroup(Long id, Group groupDetails) {
        Group existingGroup = groupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));

        existingGroup.setName(groupDetails.getName());
        existingGroup.setDescription(groupDetails.getDescription());
        existingGroup.setPrivacyLevel(groupDetails.getPrivacyLevel());
        existingGroup.setProfilePhotoUrl(groupDetails.getProfilePhotoUrl());
        existingGroup.setCoverPhotoUrl(groupDetails.getCoverPhotoUrl());

        return groupRepository.save(existingGroup);
    }

    @Override
    public void deleteGroup(Long id) {
        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));
        groupRepository.delete(group);
    }

    @Override
    public GroupMembershipRequest sendMembershipRequest(Long groupId, User user) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found with id: " + groupId));

        if (group.getMembers().contains(user)) {
            throw new IllegalStateException("User is already a member of the group");
        }

        GroupMembershipRequest request = new GroupMembershipRequest();
        request.setUser(user);
        request.setGroup(group);
        request.setStatus(GroupMembershipRequest.RequestStatus.PENDING);
        request.setRequestDate(LocalDateTime.now());

        return membershipRequestRepository.save(request);
    }

    @Override
    public GroupMembershipRequest handleMembershipRequest(Long requestId, GroupMembershipRequest.RequestStatus status) {
        GroupMembershipRequest request = membershipRequestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Membership request not found with id: " + requestId));

        request.setStatus(status);
        if (status == GroupMembershipRequest.RequestStatus.ACCEPTED) {
            Group group = request.getGroup();
            group.addMember(request.getUser()); // This creates GroupMemberSettings
            groupRepository.save(group);
        }

        return membershipRequestRepository.save(request);
    }

    @Override
    public void removeMember(Long groupId, Long userId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        User user = group.getMembers().stream()
                .filter(member -> member.getId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("User not a member of group: " + userId));

        group.removeMember(user);
        groupRepository.save(group);
    }

    @Override
    public String uploadProfilePhoto(Long groupId, MultipartFile file) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        String fileName = storeFile(file, "profile");
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        group.setProfilePhotoUrl(fileUrl);
        groupRepository.save(group);
        return fileUrl;
    }

    @Override
    public String uploadCoverPhoto(Long groupId, MultipartFile file) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        String fileName = storeFile(file, "cover");
        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(fileName)
                .toUriString();

        group.setCoverPhotoUrl(fileUrl);
        groupRepository.save(group);
        return fileUrl;
    }

    private String storeFile(MultipartFile file, String prefix) {
        try {
            String originalFileName = file.getOriginalFilename();
            String fileExtension = originalFileName != null ? originalFileName.substring(originalFileName.lastIndexOf(".")) : ".jpg";
            String storedFileName = prefix + "_" + UUID.randomUUID() + fileExtension;

            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);
            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return storedFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean isUserMemberOfGroup(Long userId, Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));
        return group.getMembers().stream().anyMatch(user -> user.getId().equals(userId));
    }

    @Override
    public List<GroupMemberSettings> findTop5Members(Long groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "publicationCount"));
        List<GroupMemberSettings> topMembers = groupRepository.findTop5MembersByGroupId(groupId, pageable);

        topMembers.forEach(settings -> updateMemberCounts(groupId, settings));

        return topMembers;
    }

    @Override
    public Page<GroupMemberSettings> findSortedMembers(Long groupId, String sortBy, String direction, Pageable pageable) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        Page<GroupMemberSettings> members = groupRepository.findMembersByGroupId(groupId, pageable);

        members.getContent().forEach(settings -> updateMemberCounts(groupId, settings));

        List<GroupMemberSettings> sortedMembers = members.getContent();
        Comparator<GroupMemberSettings> comparator;
        switch (sortBy.toLowerCase()) {
            case "commentcount":
                comparator = Comparator.comparingLong(GroupMemberSettings::getCommentCount);
                break;
            case "reactioncount":
                comparator = Comparator.comparingLong(GroupMemberSettings::getReactionCount);
                break;
            case "joindate":
                comparator = Comparator.comparing(GroupMemberSettings::getJoinDate);
                break;
            case "publicationcount":
            default:
                comparator = Comparator.comparingLong(GroupMemberSettings::getPublicationCount);
                break;
        }
        if (direction.equalsIgnoreCase("desc")) {
            comparator = comparator.reversed();
        }

        sortedMembers = sortedMembers.stream()
                .sorted(comparator)
                .collect(Collectors.toList());

        return new PageImpl<>(sortedMembers, pageable, members.getTotalElements());
    }

    @Override
    public void updateMemberSettings(Long groupId, Long userId, boolean canPost, boolean canComment) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        GroupMemberSettings settings = group.getMemberSettings().stream()
                .filter(s -> s.getUser().getId().equals(userId))
                .findFirst()
                .orElseGet(() -> {
                    // Create new settings if not found
                    User user = group.getMembers().stream()
                            .filter(m -> m.getId().equals(userId))
                            .findFirst()
                            .orElseThrow(() -> new EntityNotFoundException("User not a member of group: " + userId));
                    GroupMemberSettings newSettings = new GroupMemberSettings();
                    newSettings.setGroup(group);
                    newSettings.setUser(user);
                    newSettings.setJoinDate(LocalDateTime.now());
                    newSettings.setCanPost(true);
                    newSettings.setCanComment(true);
                    group.getMemberSettings().add(newSettings);
                    return newSettings;
                });

        settings.setCanPost(canPost);
        settings.setCanComment(canComment);
        groupRepository.save(group);
    }

    private void updateMemberCounts(Long groupId, GroupMemberSettings settings) {
        Long userId = settings.getUser().getId();
        settings.setPublicationCount(publicationRepository.countByGroupIdAndUserId(groupId, userId));
        settings.setCommentCount(commentRepository.countByGroupIdAndUserId(groupId, userId));
        settings.setReactionCount(reactionRepository.countByGroupIdAndUserId(groupId, userId));
    }
}