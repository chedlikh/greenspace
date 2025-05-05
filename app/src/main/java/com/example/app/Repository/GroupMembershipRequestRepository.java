package com.example.app.Repository;

import com.example.app.Entities.GroupMembershipRequest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupMembershipRequestRepository extends JpaRepository<GroupMembershipRequest, Long> {
}