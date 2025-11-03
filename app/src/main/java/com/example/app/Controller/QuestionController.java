package com.example.app.Controller;

import com.example.app.DTOs.QuestionDTO;
import com.example.app.Service.IQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final IQuestionService questionService;

    @Autowired
    public QuestionController(IQuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/sondage/{sondageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> createQuestion(@RequestBody QuestionDTO questionDTO,
                                                      @PathVariable Long sondageId) {
        QuestionDTO createdQuestion = questionService.createQuestion(questionDTO, sondageId);
        return new ResponseEntity<>(createdQuestion, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionDTO> updateQuestion(@RequestBody QuestionDTO questionDTO,
                                                      @PathVariable Long id) {
        questionDTO.setId(id);
        QuestionDTO updatedQuestion = questionService.updateQuestion(questionDTO);
        return new ResponseEntity<>(updatedQuestion, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<QuestionDTO> getQuestionById(@PathVariable Long id) {
        QuestionDTO question = questionService.getQuestionById(id);
        return new ResponseEntity<>(question, HttpStatus.OK);
    }

    @GetMapping("/sondage/{sondageId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<QuestionDTO>> getQuestionsBySondageId(@PathVariable Long sondageId) {
        List<QuestionDTO> questions = questionService.getQuestionsBySondageId(sondageId);
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuestionDTO>> generateAIQuestions(@RequestBody GenerateQuestionsRequest request) {
        List<QuestionDTO> questions = questionService.generateAIQuestions(
                request.getPrompt(),
                request.getCount()
        );
        return new ResponseEntity<>(questions, HttpStatus.OK);
    }

    @PostMapping("/save/{sondageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<QuestionDTO>> saveGeneratedQuestions(@PathVariable Long sondageId,
                                                                    @RequestBody List<QuestionDTO> questions) {
        List<QuestionDTO> savedQuestions = questionService.saveGeneratedQuestions(sondageId, questions);
        return new ResponseEntity<>(savedQuestions, HttpStatus.CREATED);
    }

    public static class GenerateQuestionsRequest {
        private String prompt;
        private int count;

        public String getPrompt() {
            return prompt;
        }

        public void setPrompt(String prompt) {
            this.prompt = prompt;
        }

        public int getCount() {
            return count;
        }

        public void setCount(int count) {
            this.count = count;
        }
    }
}