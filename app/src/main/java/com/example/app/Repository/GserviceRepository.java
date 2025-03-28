package com.example.app.Repository;

import com.example.app.Entities.Gservice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GserviceRepository extends JpaRepository<Gservice, Long> {
}