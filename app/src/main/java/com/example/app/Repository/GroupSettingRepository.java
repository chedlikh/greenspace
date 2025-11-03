package com.example.app.Repository;

import com.example.app.Entities.GroupSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupSettingRepository extends JpaRepository<GroupSetting, Long> {

    @Query("SELECT gs FROM GroupSetting gs " +
            "WHERE gs.conversation.id = :conversationId")
    List<GroupSetting> findByConversationId(@Param("conversationId") Long conversationId);

    @Query("SELECT gs FROM GroupSetting gs " +
            "WHERE gs.conversation.id = :conversationId " +
            "AND gs.settingKey = :settingKey")
    Optional<GroupSetting> findByConversationIdAndSettingKey(@Param("conversationId") Long conversationId,
                                                             @Param("settingKey") String settingKey);
}
