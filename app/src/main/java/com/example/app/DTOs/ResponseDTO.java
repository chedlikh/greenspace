package com.example.app.DTOs;

import java.time.LocalDateTime;

public class ResponseDTO {
    private Long id;
    private String answerText;
    private String selectedChoices;
    private Integer ratingValue;
    private Boolean yesNoAnswer;
    private LocalDateTime submissionTime;
    private Long questionId;
    private Long userId;

    public ResponseDTO() {
    }

    public ResponseDTO(Long id, String answerText, String selectedChoices, Integer ratingValue,
                       Boolean yesNoAnswer, LocalDateTime submissionTime, Long questionId, Long userId) {
        this.id = id;
        this.answerText = answerText;
        this.selectedChoices = selectedChoices;
        this.ratingValue = ratingValue;
        this.yesNoAnswer = yesNoAnswer;
        this.submissionTime = submissionTime;
        this.questionId = questionId;
        this.userId = userId;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAnswerText() {
        return answerText;
    }

    public void setAnswerText(String answerText) {
        this.answerText = answerText;
    }

    public String getSelectedChoices() {
        return selectedChoices;
    }

    public void setSelectedChoices(String selectedChoices) {
        this.selectedChoices = selectedChoices;
    }

    public Integer getRatingValue() {
        return ratingValue;
    }

    public void setRatingValue(Integer ratingValue) {
        this.ratingValue = ratingValue;
    }

    public Boolean getYesNoAnswer() {
        return yesNoAnswer;
    }

    public void setYesNoAnswer(Boolean yesNoAnswer) {
        this.yesNoAnswer = yesNoAnswer;
    }

    public LocalDateTime getSubmissionTime() {
        return submissionTime;
    }

    public void setSubmissionTime(LocalDateTime submissionTime) {
        this.submissionTime = submissionTime;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}