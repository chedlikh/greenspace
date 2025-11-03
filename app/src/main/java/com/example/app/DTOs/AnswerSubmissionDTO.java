package com.example.app.DTOs;

public class AnswerSubmissionDTO {
    private Long questionId;
    private String answerText;
    private String selectedChoices;
    private Integer ratingValue;
    private Boolean yesNoAnswer;

    public AnswerSubmissionDTO() {
    }

    public AnswerSubmissionDTO(Long questionId, String answerText, String selectedChoices, Integer ratingValue, Boolean yesNoAnswer) {
        this.questionId = questionId;
        this.answerText = answerText;
        this.selectedChoices = selectedChoices;
        this.ratingValue = ratingValue;
        this.yesNoAnswer = yesNoAnswer;
    }

    public Long getQuestionId() {
        return questionId;
    }

    public void setQuestionId(Long questionId) {
        this.questionId = questionId;
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
}
