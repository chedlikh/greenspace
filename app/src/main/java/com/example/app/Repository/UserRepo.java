package com.example.app.Repository;

import com.example.app.Entities.User;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<User,Long> {
    @EntityGraph(attributePaths = {
            "poste",
            "poste.gservices",
            "poste.gservices.sites",
            "poste.gservices.sites.societe",
            "roles"
    })
    @Transactional
    Optional<User> findByUsername(String username);
    List<User> findByPhone(Long phone);
    List<User> findByFirstnameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName);
    Optional<User> findByEmail(String email);
    List<User> findByPosteId(Long posteId);
    @Query("SELECT u FROM User u JOIN u.poste p JOIN p.gservices s WHERE s.id = :serviceId")
    List<User> findUsersByServiceId(@Param("serviceId") Long serviceId);


}
