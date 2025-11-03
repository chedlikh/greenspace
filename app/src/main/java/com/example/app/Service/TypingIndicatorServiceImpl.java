package com.example.app.Service;

import com.example.app.DTOs.TypingIndicatorDTO;
import com.example.app.Entities.TypingIndicator;
import com.example.app.Repository.ConversationRepository;
import com.example.app.Repository.TypingIndicatorRepository;
import com.example.app.Repository.UserRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TypingIndicatorServiceImpl implements TypingIndicatorService {

    @Autowired
    private TypingIndicatorRepository typingIndicatorRepository;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepo userRepository;

    @Override
    public void startTyping(Long conversationId, Long userId) {
        updateTypingStatus(conversationId, userId, true);
    }

    @Override
    public void stopTyping(Long conversationId, Long userId) {
        updateTypingStatus(conversationId, userId, false);
    }

    @Override
    public void updateTypingStatus(Long conversationId, Long userId, boolean isTyping) {
        TypingIndicator indicator = typingIndicatorRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseGet(() -> {
                    TypingIndicator newIndicator = new TypingIndicator();
                    newIndicator.setConversation(conversationRepository.findById(conversationId)
                            .orElseThrow(() -> new IllegalArgumentException("Conversation not found")));
                    newIndicator.setUser(userRepository.findById(userId)
                            .orElseThrow(() -> new IllegalArgumentException("User not found")));
                    return newIndicator;
                });
        indicator.setTyping(isTyping);
        indicator.setLastTypingDate(LocalDateTime.now());
        typingIndicatorRepository.save(indicator);

        TypingIndicatorDTO indicatorDTO = modelMapper.map(indicator, TypingIndicatorDTO.class);
        webSocketService.broadcastTypingIndicator(conversationId, indicatorDTO);
    }

    @Override
    public List<TypingIndicatorDTO> getTypingUsers(Long conversationId) {
        return typingIndicatorRepository.findTypingUsers(conversationId, 0L)
                .stream()
                .map(ind -> modelMapper.map(ind, TypingIndicatorDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getTypingUsernames(Long conversationId) {
        return getTypingUsers(conversationId)
                .stream()
                .map(ind -> ind.getUser().getUsername())
                .collect(Collectors.toList());
    }

    @Override
    public boolean isUserTyping(Long conversationId, Long userId) {
        return typingIndicatorRepository.findByConversationIdAndUserId(conversationId, userId)
                .map(TypingIndicator::getTyping)
                .orElse(false);
    }

    @Override
    public void cleanupExpiredTypingIndicators() {
        typingIndicatorRepository.clearExpiredTypingIndicators(LocalDateTime.now().minusSeconds(30));
    }

    @Override
    public void clearTypingIndicator(Long conversationId, Long userId) {
        typingIndicatorRepository.findByConversationIdAndUserId(conversationId, userId)
                .ifPresent(ind -> {
                    ind.setTyping(false);
                    typingIndicatorRepository.save(ind);
                });
    }

    @Override
    public void clearAllTypingIndicators(Long conversationId) {
        typingIndicatorRepository.findTypingUsers(conversationId, 0L)
                .forEach(ind -> {
                    ind.setTyping(false);
                    typingIndicatorRepository.save(ind);
                });
    }
}