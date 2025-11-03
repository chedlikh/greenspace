package com.example.app.DTOs;

import lombok.Data;

@Data
public class PosteDTO {
    private Long id;
    private String titre;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public PosteDTO(Long id, String titre) {
        this.id = id;
        this.titre = titre;
    }

    public PosteDTO() {
    }
}