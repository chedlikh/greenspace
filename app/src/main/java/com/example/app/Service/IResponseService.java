package com.example.app.Service;

import com.example.app.DTOs.AnswerSubmissionDTO;
import com.example.app.DTOs.QuestionDTO;
import com.example.app.DTOs.ResponseDTO;
import com.example.app.Entities.Response;

import java.util.List;
import java.util.Map;

public interface IResponseService {
    ResponseDTO submitResponse(Long questionId, Long userId, AnswerSubmissionDTO submission);
    ResponseDTO updateResponse(Long responseId, AnswerSubmissionDTO submission);
    void deleteResponse(Long id);
    Response getResponseById(Long id);
    List<ResponseDTO> getResponsesByQuestionId(Long questionId);
    List<ResponseDTO> getResponsesByUserId(Long userId);
    List<ResponseDTO> getResponsesBySondageId(Long sondageId);
    boolean hasUserRespondedToSondage(Long questionId, Long userId);
    Map<QuestionDTO, ResponseDTO> getUserResponsesForSondage(Long sondageId, Long userId);
    Map<String, Object> getSondageResponseStatistics(Long sondageId);
}