package com.example.app.DTOs;

import com.example.app.Entities.GroupMembershipRequest.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupMembershipRequestDTO {
    private Long id;
    private Long userId;
    private String username;
    private Long groupId;
    private RequestStatus status;
    private LocalDateTime requestDate;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public RequestStatus getStatus() {
        return status;
    }

    public void setStatus(RequestStatus status) {
        this.status = status;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public void setRequestDate(LocalDateTime requestDate) {
        this.requestDate = requestDate;
    }
    public GroupMembershipRequestDTO(Long id, Long userId, String username,
                                     Long groupId, RequestStatus status, LocalDateTime requestDate) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.groupId = groupId;
        this.status = status;
        this.requestDate = requestDate;
    }

}