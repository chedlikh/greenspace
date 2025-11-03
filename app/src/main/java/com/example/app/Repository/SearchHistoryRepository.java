package com.example.app.Repository;

import com.example.app.Entities.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, Long> {

    @Query("SELECT sh FROM SearchHistory sh WHERE sh.user.id = :userId ORDER BY sh.searchDate DESC")
    List<SearchHistory> findByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("DELETE FROM SearchHistory sh WHERE sh.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}