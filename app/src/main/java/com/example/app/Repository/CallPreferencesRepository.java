package com.example.app.Repository;

import com.example.app.Entities.CallPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CallPreferencesRepository extends JpaRepository<CallPreferences, Long> {
    Optional<CallPreferences> findByUserId(Long userId);
}
