package com.example.app.Service;

import com.example.app.DTOs.QuestionDTO;
import com.example.app.Entities.Question;
import com.example.app.Entities.Sondage;
import com.example.app.Mappers.QuestionMapper;
import com.example.app.Repository.QuestionRepository;
import com.example.app.Repository.SondageRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class QuestionServiceImpl implements IQuestionService {
    private static final Logger logger = LoggerFactory.getLogger(QuestionServiceImpl.class);

    private final QuestionRepository questionRepository;
    private final SondageRepository sondageRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final QuestionMapper questionMapper;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent}")
    private String geminiApiUrl;

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Autowired
    public QuestionServiceImpl(QuestionRepository questionRepository,
                               SondageRepository sondageRepository,
                               QuestionMapper questionMapper) {
        this.questionRepository = questionRepository;
        this.sondageRepository = sondageRepository;
        this.questionMapper = questionMapper;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Transactional
    public QuestionDTO createQuestion(QuestionDTO questionDTO, Long sondageId) {
        Sondage sondage = sondageRepository.findById(sondageId)
                .orElseThrow(() -> new EntityNotFoundException("Sondage not found with id: " + sondageId));

        Question question = questionMapper.toEntity(questionDTO);
        question.setSondage(sondage);
        validateQuestion(question);
        Question savedQuestion = questionRepository.save(question);
        return questionMapper.toDTO(savedQuestion);
    }

    @Override
    @Transactional
    public QuestionDTO updateQuestion(QuestionDTO questionDTO) {
        Question existingQuestion = questionRepository.findById(questionDTO.getId())
                .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + questionDTO.getId()));

        existingQuestion.setContent(questionDTO.getContent());
        existingQuestion.setType(questionDTO.getType());
        existingQuestion.setChoices(questionDTO.getChoices());
        validateQuestion(existingQuestion);
        Question updatedQuestion = questionRepository.save(existingQuestion);
        return questionMapper.toDTO(updatedQuestion);
    }

    @Override
    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Override
    public QuestionDTO getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Question not found with id: " + id));
        return questionMapper.toDTO(question);
    }

    @Override
    public List<QuestionDTO> getQuestionsBySondageId(Long sondageId) {
        List<Question> questions = questionRepository.findBySondageId(sondageId);
        return questionMapper.toDTOList(questions);
    }

    @Override
    @Transactional
    public List<QuestionDTO> generateAIQuestions(String prompt, int count) {
        logger.info("Generating AI questions with prompt: {}", prompt);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Validate API key
            if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
                logger.error("Gemini API key is missing or empty");
                throw new IllegalStateException("Gemini API key is not configured");
            }

            // Construct URL with query parameter
            String urlWithKey = geminiApiUrl + "?key=" + geminiApiKey.trim();
            logger.info("Calling Gemini API at: {}", urlWithKey);

            String aiPrompt = String.format(
                    "Generate exactly %d unique survey questions about \"%s\". " +
                            "Ensure the questions cover a variety of topics and include at least one of each type: TEXT, SINGLE_CHOICE (with exactly 4 options), MULTIPLE_CHOICE (with exactly 4 options), RATING (on a scale of 1 to 5), YES_NO. " +
                            "Format the output as a clean JSON array of objects, where each object has: " +
                            "- 'content': the question text (string, clear and concise), " +
                            "- 'type': one of 'TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'RATING', 'YES_NO' (string), " +
                            "- 'choices': an array of 4 strings for SINGLE_CHOICE and MULTIPLE_CHOICE questions, empty array for other types. " +
                            "Do not wrap the JSON in markdown code fences or include any additional text outside the JSON array. " +
                            "Example: [{\"content\": \"What is your feedback?\", \"type\": \"TEXT\", \"choices\": []}, " +
                            "{\"content\": \"What is your favorite color?\", \"type\": \"SINGLE_CHOICE\", \"choices\": [\"Red\", \"Blue\", \"Green\", \"Yellow\"]}]",
                    count, prompt
            );

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(Map.of(
                    "parts", List.of(Map.of("text", aiPrompt))
            )));
            requestBody.put("generationConfig", Map.of(
                    "temperature", 0.7,
                    "maxOutputTokens", 2000
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    urlWithKey,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );

            List<Question> generatedQuestions = parseGeminiResponse(response);
            logger.info("Generated {} questions", generatedQuestions.size());
            return questionMapper.toDTOList(generatedQuestions);

        } catch (HttpClientErrorException e) {
            logger.error("Gemini API error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Failed to generate questions using Gemini API: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Error generating AI questions with Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate questions using Gemini API", e);
        }
    }

    private List<Question> parseGeminiResponse(ResponseEntity<Map> response) {
        List<Question> generatedQuestions = new ArrayList<>();

        if (response.getStatusCode() != HttpStatus.OK || response.getBody() == null) {
            logger.warn("Invalid Gemini API response: status {}", response.getStatusCode());
            return createFallbackQuestion("Unable to generate questions due to API error");
        }

        Map<String, Object> responseBody = response.getBody();
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody.get("candidates");

        if (candidates == null || candidates.isEmpty()) {
            logger.warn("Gemini API response contains no candidates");
            return createFallbackQuestion("No questions generated by Gemini API");
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        if (content == null) {
            logger.warn("Gemini API response contains no content");
            return createFallbackQuestion("No content in Gemini API response");
        }

        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        if (parts == null || parts.isEmpty()) {
            logger.warn("Gemini API response contains no parts");
            return createFallbackQuestion("No parts in Gemini API response");
        }

        String jsonText = (String) parts.get(0).get("text");
        if (jsonText == null || jsonText.trim().isEmpty()) {
            logger.warn("Gemini API response contains empty text");
            return createFallbackQuestion("Empty response from Gemini API");
        }

        // Remove markdown code fences if present
        jsonText = jsonText.replaceAll("```json\\n|```", "").trim();

        try {
            List<Map<String, Object>> questionsData = objectMapper.readValue(jsonText, new TypeReference<List<Map<String, Object>>>(){});
            for (Map<String, Object> qData : questionsData) {
                Question question = new Question();
                question.setContent((String) qData.get("content"));
                question.setType(Question.QuestionType.valueOf((String) qData.get("type")));
                if (qData.containsKey("choices")) {
                    List<String> choicesList = (List<String>) qData.get("choices");
                    question.setChoices(new HashSet<>(choicesList));
                }
                validateQuestion(question);
                generatedQuestions.add(question);
            }
        } catch (Exception e) {
            logger.error("Failed to parse Gemini API response as JSON: {}", e.getMessage(), e);
            return createFallbackQuestion(jsonText);
        }

        return generatedQuestions;
    }

    private List<Question> createFallbackQuestion(String content) {
        Question fallbackQuestion = new Question();
        fallbackQuestion.setContent("Please provide feedback: " + content);
        fallbackQuestion.setType(Question.QuestionType.TEXT);
        fallbackQuestion.setChoices(new HashSet<>());
        return Collections.singletonList(fallbackQuestion);
    }

    @Override
    @Transactional
    public List<QuestionDTO> saveGeneratedQuestions(Long sondageId, List<QuestionDTO> questionDTOs) {
        logger.info("Saving {} generated questions for sondage ID: {}", questionDTOs.size(), sondageId);

        Sondage sondage = sondageRepository.findById(sondageId)
                .orElseThrow(() -> new EntityNotFoundException("Sondage not found with id: " + sondageId));

        List<Question> questions = questionDTOs.stream()
                .map(questionMapper::toEntity)
                .peek(question -> {
                    question.setSondage(sondage);
                    validateQuestion(question);
                })
                .toList();

        List<Question> savedQuestions = questionRepository.saveAll(questions);
        return questionMapper.toDTOList(savedQuestions);
    }

    private void validateQuestion(Question question) {
        if (question.getContent() == null || question.getContent().trim().isEmpty()) {
            throw new IllegalArgumentException("Question content cannot be empty");
        }
        if (question.getType() == Question.QuestionType.SINGLE_CHOICE || question.getType() == Question.QuestionType.MULTIPLE_CHOICE) {
            if (question.getChoices() == null || question.getChoices().size() < 2) {
                throw new IllegalArgumentException("Choice-based questions require at least 2 choices");
            }
        }
    }
}