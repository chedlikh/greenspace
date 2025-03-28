package com.example.app.Repository;

import com.example.app.Entities.Token;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<Token,Integer> {
    @Query("""
select t from Token t inner join User u on t.user.id = u.id
where t.user.id = :userId and t.loggedOut = false
""")
    List<Token> findAllAccessTokensByUser(Long userId);

    Optional<Token> findByAccessToken(String token);

    Optional<Token > findByRefreshToken(String token);
    List<Token> findAllByUser(User user);
    void deleteAllByLoggedOutTrueAndExpirationBefore(LocalDateTime now);
    List<Token> findByLoggedOutFalseAndExpirationAfter(LocalDateTime expirationTime); // Active tokens
    void deleteByLoggedOutTrue();


}
