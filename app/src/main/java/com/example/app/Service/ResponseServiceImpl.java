package com.example.app.Service;

import com.example.app.DTOs.AnswerSubmissionDTO;
import com.example.app.DTOs.QuestionDTO;
import com.example.app.DTOs.ResponseDTO;
import com.example.app.Entities.*;
import com.example.app.Mappers.QuestionMapper;
import com.example.app.Repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ResponseServiceImpl implements IResponseService {
    private static final Logger logger = LoggerFactory.getLogger(ResponseServiceImpl.class);

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepo userRepository;
    private final SondageRepository sondageRepository;
    private final QuestionMapper questionMapper;

    @Autowired
    public ResponseServiceImpl(AnswerRepository answerRepository,
                               QuestionRepository questionRepository,
                               UserRepo userRepository,
                               SondageRepository sondageRepository,
                               QuestionMapper questionMapper) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
        this.userRepository = userRepository;
        this.sondageRepository = sondageRepository;
        this.questionMapper = questionMapper;
    }

    @Override
    @Transactional
    public ResponseDTO submitResponse(Long questionId, Long userId, AnswerSubmissionDTO submission) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + questionId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        Sondage sondage = question.getSondage();

        if (!canUserAnswerSondage(user, sondage)) {
            throw new IllegalStateException("User is not authorized to answer this survey");
        }

        if (answerRepository.existsByQuestionIdAndUserId(questionId, userId)) {
            throw new IllegalStateException("User has already responded to this question");
        }

        Response response = new Response();
        response.setQuestion(question);
        response.setUser(user);

        validateSubmission(submission, question);

        switch (question.getType()) {
            case TEXT:
                response.setAnswerText(submission.getAnswerText());
                break;
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                response.setSelectedChoices(submission.getSelectedChoices());
                break;
            case RATING:
                response.setRatingValue(submission.getRatingValue());
                break;
            case YES_NO:
                response.setYesNoAnswer(submission.getYesNoAnswer());
                break;
        }

        Response savedResponse = answerRepository.save(response);
        return toResponseDTO(savedResponse);
    }

    private ResponseDTO toResponseDTO(Response response) {
        return new ResponseDTO(
                response.getId(),
                response.getAnswerText(),
                response.getSelectedChoices(),
                response.getRatingValue(),
                response.getYesNoAnswer(),
                response.getSubmissionTime(),
                response.getQuestion().getId(),
                response.getUser().getId()
        );
    }

    private void validateSubmission(AnswerSubmissionDTO submission, Question question) {
        switch (question.getType()) {
            case TEXT:
                if (submission.getAnswerText() == null || submission.getAnswerText().trim().isEmpty()) {
                    throw new IllegalArgumentException("Text answer is required for TEXT questions");
                }
                break;
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                if (submission.getSelectedChoices() == null || submission.getSelectedChoices().trim().isEmpty()) {
                    throw new IllegalArgumentException("Selected choices are required for choice-based questions");
                }
                String[] selected = submission.getSelectedChoices().split(",");
                for (String choice : selected) {
                    if (!question.getChoices().contains(choice.trim())) {
                        throw new IllegalArgumentException("Invalid choice: " + choice);
                    }
                }
                if (question.getType() == Question.QuestionType.SINGLE_CHOICE && selected.length > 1) {
                    throw new IllegalArgumentException("Only one choice allowed for SINGLE_CHOICE questions");
                }
                break;
            case RATING:
                if (submission.getRatingValue() == null || submission.getRatingValue() < 1 || submission.getRatingValue() > 5) {
                    throw new IllegalArgumentException("Rating must be between 1 and 5");
                }
                break;
            case YES_NO:
                if (submission.getYesNoAnswer() == null) {
                    throw new IllegalArgumentException("Yes/No answer is required");
                }
                break;
        }
    }

    private boolean canUserAnswerSondage(User user, Sondage sondage) {
        if (sondage.getStatus() != Sondage.SondageStatus.STARTED) {
            return false;
        }
        Set<Gservice> userGservices = user.getPoste().getGservices();
        Set<Gservice> sondageGservices = sondage.getGservices();
        return userGservices.stream().anyMatch(sondageGservices::contains);
    }

    @Override
    @Transactional
    public ResponseDTO updateResponse(Long responseId, AnswerSubmissionDTO submission) {
        Response existingResponse = getResponseById(responseId);
        Question question = existingResponse.getQuestion();

        validateSubmission(submission, question);

        existingResponse.setAnswerText(null);
        existingResponse.setSelectedChoices(null);
        existingResponse.setRatingValue(null);
        existingResponse.setYesNoAnswer(null);

        switch (question.getType()) {
            case TEXT:
                existingResponse.setAnswerText(submission.getAnswerText());
                break;
            case SINGLE_CHOICE:
            case MULTIPLE_CHOICE:
                existingResponse.setSelectedChoices(submission.getSelectedChoices());
                break;
            case RATING:
                existingResponse.setRatingValue(submission.getRatingValue());
                break;
            case YES_NO:
                existingResponse.setYesNoAnswer(submission.getYesNoAnswer());
                break;
        }

        Response updatedResponse = answerRepository.save(existingResponse);
        return toResponseDTO(updatedResponse);
    }

    @Override
    public void deleteResponse(Long id) {
        answerRepository.deleteById(id);
    }

    @Override
    public Response getResponseById(Long id) {
        return answerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Response not found with id: " + id));
    }

    @Override
    public List<ResponseDTO> getResponsesByQuestionId(Long questionId) {
        return answerRepository.findByQuestionId(questionId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseDTO> getResponsesByUserId(Long userId) {
        return answerRepository.findByUserId(userId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResponseDTO> getResponsesBySondageId(Long sondageId) {
        return answerRepository.findByQuestionSondageId(sondageId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean hasUserRespondedToSondage(Long questionId, Long userId) {
        return answerRepository.existsByQuestionIdAndUserId(questionId, userId);
    }

    @Override
    public Map<QuestionDTO, ResponseDTO> getUserResponsesForSondage(Long sondageId, Long userId) {
        List<Response> responses = answerRepository.findByQuestionSondageId(sondageId)
                .stream()
                .filter(r -> r.getUser().getId().equals(userId))
                .collect(Collectors.toList());
        return responses.stream()
                .collect(Collectors.toMap(
                        response -> questionMapper.toDTO(response.getQuestion()),
                        this::toResponseDTO
                ));
    }

    @Override
    public Map<String, Object> getSondageResponseStatistics(Long sondageId) {
        Sondage sondage = sondageRepository.findById(sondageId)
                .orElseThrow(() -> new EntityNotFoundException("Sondage not found with id: " + sondageId));

        List<Response> responses = answerRepository.findByQuestionSondageId(sondageId);
        List<Question> questions = questionRepository.findBySondageId(sondageId);
        List<QuestionDTO> questionDTOs = questionMapper.toDTOList(questions);

        Map<String, Object> statistics = new HashMap<>();

        statistics.put("totalResponses", responses.size());
        statistics.put("uniqueRespondents", answerRepository.countDistinctUsersBySondageId(sondageId));

        Map<Long, Integer> responseCountByQuestion = responses.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getQuestion().getId(),
                        Collectors.summingInt(r -> 1)
                ));
        statistics.put("responseCountByQuestion", responseCountByQuestion);

        Map<Long, Map<String, Object>> questionStatistics = new HashMap<>();
        for (QuestionDTO questionDTO : questionDTOs) {
            Long questionId = questionDTO.getId();
            List<Response> questionResponses = responses.stream()
                    .filter(r -> r.getQuestion().getId().equals(questionId))
                    .collect(Collectors.toList());

            Map<String, Object> questionStats = new HashMap<>();
            questionStats.put("questionId", questionId);
            questionStats.put("questionContent", questionDTO.getContent());
            questionStats.put("responseCount", questionResponses.size());

            switch (questionDTO.getType()) {
                case SINGLE_CHOICE:
                case MULTIPLE_CHOICE:
                    Map<String, Integer> choiceCounts = new HashMap<>();
                    for (Response response : questionResponses) {
                        if (response.getSelectedChoices() != null && !response.getSelectedChoices().isEmpty()) {
                            String[] choices = response.getSelectedChoices().split(",");
                            for (String choice : choices) {
                                choiceCounts.put(choice.trim(),
                                        choiceCounts.getOrDefault(choice.trim(), 0) + 1);
                            }
                        }
                    }
                    questionStats.put("choiceCounts", choiceCounts);
                    break;
                case RATING:
                    double averageRating = questionResponses.stream()
                            .filter(r -> r.getRatingValue() != null)
                            .mapToInt(Response::getRatingValue)
                            .average()
                            .orElse(0.0);
                    questionStats.put("averageRating", averageRating);
                    Map<Integer, Integer> ratingDistribution = questionResponses.stream()
                            .filter(r -> r.getRatingValue() != null)
                            .collect(Collectors.groupingBy(
                                    Response::getRatingValue,
                                    Collectors.summingInt(r -> 1)
                            ));
                    questionStats.put("ratingDistribution", ratingDistribution);
                    break;
                case YES_NO:
                    long yesCount = questionResponses.stream()
                            .filter(r -> Boolean.TRUE.equals(r.getYesNoAnswer()))
                            .count();
                    questionStats.put("yesCount", yesCount);
                    questionStats.put("noCount", questionResponses.size() - yesCount);
                    break;
                case TEXT:
                    questionStats.put("textResponseCount", questionResponses.size());
                    break;
            }
            questionStatistics.put(questionId, questionStats);
        }

        statistics.put("questionStatistics", questionStatistics);
        return statistics;
    }
}