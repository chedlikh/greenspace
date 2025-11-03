package com.example.app.Service;

import com.example.app.Entities.Call;
import com.example.app.Entities.Message;
import com.example.app.Entities.MessageAttachment;
import com.example.app.Repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatAnalyticsServiceImpl implements ChatAnalyticsService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private CallRepository callRepository;
    @Autowired
    private MessageAttachmentRepository attachmentRepository;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private CallService callService;
    @Autowired
    private ConversationParticipantRepository participantRepository;


    @Override
    public long getTotalMessagesCount() {
        return messageRepository.count();
    }

    @Override
    public long getUserMessageCount(Long userId) {
        return messageRepository.findBySenderId(userId).size();
    }

    @Override
    public long getConversationMessageCount(Long conversationId) {
        return messageRepository.countMessagesByConversationId(conversationId);
    }

    @Override
    public Map<String, Long> getMessageTypeDistribution() {
        return messageRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        msg -> msg.getType().name(),
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getMessagesPerDay(LocalDateTime startDate, LocalDateTime endDate) {
        return messageRepository.findMessagesByDateRange(null, startDate, endDate, null)
                .getContent()
                .stream()
                .collect(Collectors.groupingBy(
                        msg -> msg.getSentDate().toLocalDate().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public long getActiveUsersCount() {
        return userRepository.count();
    }

    @Override
    public long getDailyActiveUsers(LocalDateTime date) {
        return messageRepository.findBySentDateAfter(date.minusDays(1))
                .stream()
                .map(Message::getSender)
                .distinct()
                .count();
    }

    @Override
    public long getMonthlyActiveUsers(int year, int month) {
        LocalDateTime start = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime end = start.plusMonths(1);
        return messageRepository.findBySentDateBetween(start, end)
                .stream()
                .map(Message::getSender)
                .distinct()
                .count();
    }

    @Override
    public Map<String, Long> getUserActivityStats(Long userId) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("messagesSent", getUserMessageCount(userId));
        stats.put("callsParticipated", (long) callRepository.findByUserIdOrderByStartedDateDesc(userId, null).getTotalElements());
        return stats;
    }

    @Override
    public long getTotalConversationsCount() {
        return conversationRepository.count();
    }

    @Override
    public long getGroupConversationsCount() {
        return conversationRepository.findByIsGroupTrue().size();
    }

    @Override
    public long getDirectConversationsCount() {
        return conversationRepository.findByIsGroupFalse().size();
    }

    @Override
    public Map<String, Object> getConversationStats(Long conversationId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("messageCount", getConversationMessageCount(conversationId));
        stats.put("participantCount", participantRepository.countActiveParticipants(conversationId));
        stats.put("callCount", callRepository.findByConversationIdOrderByStartedDateDesc(conversationId, null).getTotalElements());
        return stats;
    }

    @Override
    public long getTotalCallsCount() {
        return callRepository.count();
    }

    @Override
    public long getSuccessfulCallsCount() {
        return callRepository.findByStatus(Call.CallStatus.ENDED).size();
    }

    @Override
    public long getMissedCallsCount() {
        return callRepository.findByStatus(Call.CallStatus.MISSED).size();
    }

    @Override
    public Map<String, Long> getCallTypeDistribution() {
        return callRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        call -> call.getType().name(),
                        Collectors.counting()
                ));
    }

    @Override
    public double getAverageCallDuration() {
        return callRepository.findAll()
                .stream()
                .mapToInt(Call::getDuration)
                .average()
                .orElse(0.0);
    }

    @Override
    public Map<String, Object> getUserCallStats(Long userId) {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCalls", callRepository.findByUserIdOrderByStartedDateDesc(userId, null).getTotalElements());
        stats.put("totalDuration", callService.getTotalCallDuration(userId));
        return stats;
    }

    @Override
    public long getTotalFilesUploaded() {
        return attachmentRepository.count();
    }

    @Override
    public long getFilesSizeTotal() {
        return attachmentRepository.findAll()
                .stream()
                .mapToLong(MessageAttachment::getFileSize)
                .sum();
    }

    @Override
    public Map<String, Long> getFileTypeDistribution() {
        return attachmentRepository.findAll()
                .stream()
                .collect(Collectors.groupingBy(
                        att -> att.getType().name(),
                        Collectors.counting()
                ));
    }

    @Override
    public Map<String, Long> getFilesUploadedPerDay(LocalDateTime startDate, LocalDateTime endDate) {
        return attachmentRepository.findByMessageSentDateBetween(startDate, endDate)
                .stream()
                .collect(Collectors.groupingBy(
                        att -> att.getMessage().getSentDate().toLocalDate().toString(),
                        Collectors.counting()
                ));
    }

    @Override
    public long getCurrentOnlineUsers() {
        return webSocketService.getConnectedUsers().size();
    }

    @Override
    public long getCurrentActiveCalls() {
        return callRepository.findActiveCallsByUserId(0L, Arrays.asList(
                Call.CallStatus.INITIATED,
                Call.CallStatus.RINGING,
                Call.CallStatus.ACTIVE
        )).size();
    }

    @Override
    public Map<String, Long> getRealtimeStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("onlineUsers", getCurrentOnlineUsers());
        stats.put("activeCalls", getCurrentActiveCalls());
        return stats;
    }

    @Override
    public double getAverageMessageDeliveryTime() {
        // Placeholder: Implement delivery time tracking
        return 0.0;
    }

    @Override
    public double getAverageResponseTime() {
        // Placeholder: Implement response time tracking
        return 0.0;
    }

    @Override
    public Map<String, Object> getSystemPerformanceMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("avgMessageDeliveryTime", getAverageMessageDeliveryTime());
        metrics.put("avgResponseTime", getAverageResponseTime());
        return metrics;
    }
}