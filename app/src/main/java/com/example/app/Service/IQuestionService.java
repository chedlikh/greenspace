package com.example.app.Service;

import com.example.app.DTOs.QuestionDTO;
import com.example.app.Entities.Question;
import jakarta.transaction.Transactional;

import java.util.List;

public interface IQuestionService {
    QuestionDTO createQuestion(QuestionDTO questionDTO, Long sondageId);
    QuestionDTO updateQuestion(QuestionDTO questionDTO);
    void deleteQuestion(Long id);
    QuestionDTO getQuestionById(Long id);
    List<QuestionDTO> getQuestionsBySondageId(Long sondageId);

    @Transactional
    List<QuestionDTO> generateAIQuestions(String prompt, int count);

    List<QuestionDTO> saveGeneratedQuestions(Long sondageId, List<QuestionDTO> questions);
}