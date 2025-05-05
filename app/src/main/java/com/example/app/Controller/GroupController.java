package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import com.example.app.Entities.GroupMembershipRequest;
import com.example.app.Entities.Publication;
import com.example.app.Entities.User;
import com.example.app.Mappers.GroupMapper;
import com.example.app.Mappers.PublicationMapper;
import com.example.app.Service.IGroupService;
import com.example.app.Service.IPublicationService;
import com.example.app.Service.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private IGroupService groupService;

    @Autowired
    private IPublicationService publicationService;

    @Autowired
    private UserService userService;

    @Autowired
    private GroupMapper groupMapper;

    @Autowired
    private PublicationMapper publicationMapper;

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupCreateDTO groupDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupMapper.toEntity(groupDto);
        group.setAdmin(currentUser);
        group.addMember(currentUser); // Admin is automatically a member

        Group savedGroup = groupService.saveGroup(group);
        return new ResponseEntity<>(groupMapper.toDto(savedGroup), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<GroupDTO>> getAllGroups(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createDate") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<Group> groups = groupService.findAllPaginated(pageable);

        Page<GroupDTO> dtoPage = groups.map(groupMapper::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable Long id) {
        return groupService.findById(id)
                .map(group -> new ResponseEntity<>(groupMapper.toDto(group), HttpStatus.OK))
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));
    }

    @GetMapping("/member/{username}")
    public ResponseEntity<Page<GroupDTO>> getGroupsByMember(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        User user = (User) userService.loadUserByUsername(username);
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"));
        Page<Group> groups = groupService.findByMemberUsernamePaginated(username, pageable);

        Page<GroupDTO> dtoPage = groups.map(groupMapper::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupDTO> updateGroup(
            @PathVariable Long id,
            @RequestBody GroupCreateDTO groupDetails) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group existingGroup = groupService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));

        if (!existingGroup.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Group groupToUpdate = groupMapper.toEntity(groupDetails);
        Group updatedGroup = groupService.updateGroup(id, groupToUpdate);
        return ResponseEntity.ok(groupMapper.toDto(updatedGroup));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group existingGroup = groupService.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + id));

        if (!existingGroup.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        groupService.deleteGroup(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{id}/request")
    public ResponseEntity<GroupMembershipRequestDTO> sendMembershipRequest(@PathVariable Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        GroupMembershipRequest request = groupService.sendMembershipRequest(id, currentUser);
        GroupMembershipRequestDTO requestDTO = new GroupMembershipRequestDTO(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getUsername(),
                request.getGroup().getId(),
                request.getStatus(),
                request.getRequestDate()
        );
        return new ResponseEntity<>(requestDTO, HttpStatus.CREATED);
    }

    @PutMapping("/request/{requestId}")
    public ResponseEntity<Void> handleMembershipRequest(
            @PathVariable Long requestId,
            @RequestParam GroupMembershipRequest.RequestStatus status) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        GroupMembershipRequest request = groupService.handleMembershipRequest(requestId, status);
        if (!request.getGroup().getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(HttpStatus.OK);
    }

    @DeleteMapping("/{groupId}/member/{username}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long groupId,
            @PathVariable String username) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User userToRemove = (User) userService.loadUserByUsername(username);
        groupService.removeMember(groupId, userToRemove.getId());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PostMapping("/{groupId}/publication")
    public ResponseEntity<PublicationDTO> createGroupPublication(
            @PathVariable Long groupId,
            @RequestBody PublicationCreateDTO publicationDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!groupService.isUserMemberOfGroup(currentUser.getId(), groupId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Publication publication = publicationMapper.toEntity(publicationDto);
        publication.setUser(currentUser);
        publication.setGroup(group);

        Publication savedPublication = publicationService.savePublication(publication);
        return new ResponseEntity<>(publicationMapper.toDto(savedPublication), HttpStatus.CREATED);
    }

    @GetMapping("/{groupId}/publications")
    public ResponseEntity<Page<PublicationDTO>> getGroupPublications(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        if (!groupService.isUserMemberOfGroup(currentUser.getId(), groupId) &&
                !group.getPrivacyLevel().equals(Group.PrivacyLevel.PUBLIC)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createDate"));
        Page<Publication> publications = publicationService.findByGroupIdPaginated(groupId, pageable);

        Page<PublicationDTO> dtoPage = publications.map(publicationMapper::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    @PostMapping("/{groupId}/profile-photo")
    public ResponseEntity<String> uploadProfilePhoto(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>("You don't have permission to upload a profile photo for this group", HttpStatus.FORBIDDEN);
        }

        String photoUrl = groupService.uploadProfilePhoto(groupId, file);
        return new ResponseEntity<>(photoUrl, HttpStatus.OK);
    }

    @PostMapping("/{groupId}/cover-photo")
    public ResponseEntity<String> uploadCoverPhoto(
            @PathVariable Long groupId,
            @RequestParam("file") MultipartFile file) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>("You don't have permission to upload a cover photo for this group", HttpStatus.FORBIDDEN);
        }

        String photoUrl = groupService.uploadCoverPhoto(groupId, file);
        return new ResponseEntity<>(photoUrl, HttpStatus.OK);
    }

    @GetMapping("/{groupId}/requests")
    public ResponseEntity<List<GroupMembershipRequestDTO>> getMembershipRequests(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<GroupMembershipRequestDTO> requests = group.getMembershipRequests().stream()
                .map(request -> new GroupMembershipRequestDTO(
                        request.getId(),
                        request.getUser().getId(),
                        request.getUser().getUsername(),
                        request.getGroup().getId(),
                        request.getStatus(),
                        request.getRequestDate()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{groupId}/my-request")
    public ResponseEntity<GroupMembershipRequestDTO> getUserMembershipRequest(@PathVariable Long groupId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        GroupMembershipRequest request = group.getMembershipRequests().stream()
                .filter(r -> r.getUser().getId().equals(currentUser.getId()) && r.getStatus() == GroupMembershipRequest.RequestStatus.PENDING)
                .findFirst()
                .orElse(null);

        if (request == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        GroupMembershipRequestDTO requestDTO = new GroupMembershipRequestDTO(
                request.getId(),
                request.getUser().getId(),
                request.getUser().getUsername(),
                request.getGroup().getId(),
                request.getStatus(),
                request.getRequestDate()
        );
        return new ResponseEntity<>(requestDTO, HttpStatus.OK);
    }

    @GetMapping("/{groupId}/members/top5")
    public ResponseEntity<List<GroupMemberDTO>> getTop5Members(@PathVariable Long groupId) {
        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        List<GroupMemberSettings> topMembers = groupService.findTop5Members(groupId);
        List<GroupMemberDTO> dtos = topMembers.stream()
                .map(groupMapper::toMemberDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<Page<GroupMemberDTO>> getAllMembers(
            @PathVariable Long groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "publicationCount") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        Page<GroupMemberSettings> members = groupService.findSortedMembers(groupId, sortBy, direction, pageable);

        Page<GroupMemberDTO> dtoPage = members.map(settings -> {
            GroupMemberDTO dto = groupMapper.toMemberDto(settings);
            int index = members.getContent().indexOf(settings);
            if (index == 0 && sortDirection == Sort.Direction.DESC) {
                dto.setMedal("GOLD");
            } else if (index == 1 && sortDirection == Sort.Direction.DESC) {
                dto.setMedal("SILVER");
            } else if (index == 2 && sortDirection == Sort.Direction.DESC) {
                dto.setMedal("BRONZE");
            }
            return dto;
        });

        return ResponseEntity.ok(dtoPage);
    }

    @PutMapping("/{groupId}/member/{username}/settings")
    public ResponseEntity<GroupMemberSettingsDTO> updateMemberSettings(
            @PathVariable Long groupId,
            @PathVariable String username,
            @RequestBody GroupMemberSettingsDTO settingsDto) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        Group group = groupService.findById(groupId)
                .orElseThrow(() -> new EntityNotFoundException("Group not found with id: " + groupId));

        if (!group.getAdmin().getId().equals(currentUser.getId())) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        User member = (User) userService.loadUserByUsername(username);
        groupService.updateMemberSettings(groupId, member.getId(), settingsDto.isCanPost(), settingsDto.isCanComment());

        GroupMemberSettings settings = group.getMemberSettings().stream()
                .filter(s -> s.getUser().getId().equals(member.getId()))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Member settings not found for user: " + username));

        return ResponseEntity.ok(groupMapper.toSettingsDto(settings));
    }
}