package com.example.app.Repository;

import com.example.app.Entities.Group;
import com.example.app.Entities.GroupMemberSettings;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {
    Page<Group> findAll(Pageable pageable);

    Optional<Group> findById(Long id);

    @Query("SELECT g FROM Group g JOIN g.members m WHERE m.username = :username")
    Page<Group> findByMemberUsername(@Param("username") String username, Pageable pageable);

    @Query("SELECT gms FROM GroupMemberSettings gms WHERE gms.group.id = :groupId ORDER BY gms.publicationCount DESC")
    List<GroupMemberSettings> findTop5MembersByGroupId(@Param("groupId") Long groupId, Pageable pageable);

    @Query("SELECT gms FROM GroupMemberSettings gms WHERE gms.group.id = :groupId")
    Page<GroupMemberSettings> findMembersByGroupId(@Param("groupId") Long groupId, Pageable pageable);
}