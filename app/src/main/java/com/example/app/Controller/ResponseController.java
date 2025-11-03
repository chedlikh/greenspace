package com.example.app.Controller;

import com.example.app.DTOs.AnswerSubmissionDTO;
import com.example.app.DTOs.QuestionDTO;
import com.example.app.DTOs.ResponseDTO;
import com.example.app.Entities.Response;
import com.example.app.Entities.User;
import com.example.app.Service.IResponseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/responses")
public class ResponseController {

    private final IResponseService responseService;

    @Autowired
    public ResponseController(IResponseService responseService) {
        this.responseService = responseService;
    }

    @PostMapping("/submit")
    public ResponseEntity<?> submitResponse(
            @RequestBody AnswerSubmissionDTO submission,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        try {
            ResponseDTO response = responseService.submitResponse(
                    submission.getQuestionId(),
                    user.getId(),
                    submission
            );
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateResponse(
            @PathVariable Long id,
            @RequestBody AnswerSubmissionDTO submission,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        try {
            Response existingResponse = responseService.getResponseById(id);
            if (!existingResponse.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to update this response"));
            }
            ResponseDTO updatedResponse = responseService.updateResponse(id, submission);
            return new ResponseEntity<>(updatedResponse, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteResponse(
            @PathVariable Long id,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        try {
            Response existingResponse = responseService.getResponseById(id);
            if (!existingResponse.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Unauthorized to delete this response"));
            }
            responseService.deleteResponse(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResponseDTO> getResponseById(@PathVariable Long id) {
        Response response = responseService.getResponseById(id);
        ResponseDTO responseDTO = new ResponseDTO(
                response.getId(),
                response.getAnswerText(),
                response.getSelectedChoices(),
                response.getRatingValue(),
                response.getYesNoAnswer(),
                response.getSubmissionTime(),
                response.getQuestion().getId(),
                response.getUser().getId()
        );
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }

    @GetMapping("/question/{questionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResponseDTO>> getResponsesByQuestionId(@PathVariable Long questionId) {
        List<ResponseDTO> responses = responseService.getResponsesByQuestionId(questionId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ResponseDTO>> getResponsesByUserId(
            @PathVariable Long userId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!user.getId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        List<ResponseDTO> responses = responseService.getResponsesByUserId(userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/sondage/{sondageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ResponseDTO>> getResponsesBySondageId(@PathVariable Long sondageId) {
        List<ResponseDTO> responses = responseService.getResponsesBySondageId(sondageId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/check/{questionId}/user/{userId}")
    public ResponseEntity<Map<String, Boolean>> hasUserRespondedToSondage(
            @PathVariable Long questionId,
            @PathVariable Long userId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!user.getId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        boolean hasResponded = responseService.hasUserRespondedToSondage(questionId, userId);
        return new ResponseEntity<>(Map.of("hasAnswered", hasResponded), HttpStatus.OK);
    }

    @GetMapping("/sondage/{sondageId}/user/{userId}")
    public ResponseEntity<Map<QuestionDTO, ResponseDTO>> getUserResponsesForSondage(
            @PathVariable Long sondageId,
            @PathVariable Long userId,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        if (!user.getId().equals(userId) && !authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        Map<QuestionDTO, ResponseDTO> responses = responseService.getUserResponsesForSondage(sondageId, userId);
        return new ResponseEntity<>(responses, HttpStatus.OK);
    }

    @GetMapping("/statistics/sondage/{sondageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSondageResponseStatistics(@PathVariable Long sondageId) {
        Map<String, Object> statistics = responseService.getSondageResponseStatistics(sondageId);
        return new ResponseEntity<>(statistics, HttpStatus.OK);
    }
}