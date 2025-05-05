package com.example.app.Service;

import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Entities.GroupMembershipRequest;
import com.example.app.Entities.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

public interface IGroupService {
    Group saveGroup(Group group);
    Optional<Group> findById(Long id);
    Page<Group> findAllPaginated(Pageable pageable);
    Page<Group> findByMemberUsernamePaginated(String username, Pageable pageable);
    Group updateGroup(Long id, Group groupDetails);
    void deleteGroup(Long id);
    GroupMembershipRequest sendMembershipRequest(Long groupId, User user);
    GroupMembershipRequest handleMembershipRequest(Long requestId, GroupMembershipRequest.RequestStatus status);
    void removeMember(Long groupId, Long userId);
    String uploadProfilePhoto(Long groupId, MultipartFile file);
    String uploadCoverPhoto(Long groupId, MultipartFile file);
    boolean isUserMemberOfGroup(Long userId, Long groupId);
    List<GroupMemberSettings> findTop5Members(Long groupId);
    Page<GroupMemberSettings> findSortedMembers(Long groupId, String sortBy, String direction, Pageable pageable);
    void updateMemberSettings(Long groupId, Long userId, boolean canPost, boolean canComment);
}