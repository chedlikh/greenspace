package com.example.app.Repository;

import com.example.app.Entities.Formateur;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Repository
public interface FormateurRepository extends JpaRepository<Formateur, Long> {
    Page<Formateur> findAll(Pageable pageable);
}
