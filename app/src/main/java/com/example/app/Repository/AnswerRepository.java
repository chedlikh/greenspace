package com.example.app.Repository;

import com.example.app.Entities.Response;
import com.example.app.Entities.Question;
import com.example.app.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnswerRepository extends JpaRepository<Response, Long> {
    List<Response> findByQuestionId(Long questionId);
    List<Response> findByUserId(Long userId);

    @Query("SELECT r FROM Response r JOIN r.question q WHERE q.sondage.id = :sondageId")
    List<Response> findByQuestionSondageId(Long sondageId);

    boolean existsByQuestionIdAndUserId(Long questionId, Long userId);

    @Query("SELECT COUNT(DISTINCT r.user.id) FROM Response r JOIN r.question q WHERE q.sondage.id = :sondageId")
    long countDistinctUsersBySondageId(Long sondageId);
}