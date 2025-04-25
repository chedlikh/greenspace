package com.example.app.Repository;

import com.example.app.Entities.NotificationSondage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationSondageRepo extends JpaRepository<NotificationSondage,Long> {
    List<NotificationSondage> findByRecipientUsernameAndIsReadFalse(String username);

}
