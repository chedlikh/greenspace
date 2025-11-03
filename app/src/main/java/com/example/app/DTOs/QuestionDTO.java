package com.example.app.DTOs;

import com.example.app.Entities.Question;

import java.util.HashSet;
import java.util.Set;

public class QuestionDTO {

    private Long id;
    private String content;
    private Question.QuestionType type;
    private Set<String> choices = new HashSet<>();
    private Long sondageId;

    // Constructors
    public QuestionDTO() {}

    public QuestionDTO(Question question) {
        this.id = question.getId();
        this.content = question.getContent();
        this.type = question.getType();
        this.choices = question.getChoices();
        this.sondageId = question.getSondage() != null ? question.getSondage().getId() : null;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Question.QuestionType getType() {
        return type;
    }

    public void setType(Question.QuestionType type) {
        this.type = type;
    }

    public Set<String> getChoices() {
        return choices;
    }

    public void setChoices(Set<String> choices) {
        this.choices = choices;
    }

    public Long getSondageId() {
        return sondageId;
    }

    public void setSondageId(Long sondageId) {
        this.sondageId = sondageId;
    }
}