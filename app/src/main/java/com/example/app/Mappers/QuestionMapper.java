package com.example.app.Mappers;

import com.example.app.DTOs.QuestionDTO;
import com.example.app.Entities.Question;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionMapper {

    public QuestionDTO toDTO(Question question) {
        if (question == null) {
            return null;
        }

        QuestionDTO dto = new QuestionDTO();
        dto.setId(question.getId());
        dto.setContent(question.getContent());
        dto.setType(question.getType());
        dto.setChoices(question.getChoices());
        dto.setSondageId(question.getSondage() != null ? question.getSondage().getId() : null);
        return dto;
    }

    public Question toEntity(QuestionDTO dto) {
        if (dto == null) {
            return null;
        }

        Question question = new Question();
        question.setId(dto.getId());
        question.setContent(dto.getContent());
        question.setType(dto.getType());
        question.setChoices(dto.getChoices());
        // Note: sondage is not set here; it’s handled in QuestionServiceImpl
        return question;
    }

    public List<QuestionDTO> toDTOList(List<Question> questions) {
        if (questions == null) {
            return null;
        }

        return questions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}