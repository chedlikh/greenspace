package com.example.app.Service;

import java.time.LocalDateTime;
import java.util.Map;

public interface ChatAnalyticsService {
    long getTotalMessagesCount();

    long getUserMessageCount(Long userId);

    long getConversationMessageCount(Long conversationId);

    Map<String, Long> getMessageTypeDistribution();

    Map<String, Long> getMessagesPerDay(LocalDateTime startDate, LocalDateTime endDate);

    long getActiveUsersCount();

    long getDailyActiveUsers(LocalDateTime date);

    long getMonthlyActiveUsers(int year, int month);

    Map<String, Long> getUserActivityStats(Long userId);

    long getTotalConversationsCount();

    long getGroupConversationsCount();

    long getDirectConversationsCount();

    Map<String, Object> getConversationStats(Long conversationId);

    long getTotalCallsCount();

    long getSuccessfulCallsCount();

    long getMissedCallsCount();

    Map<String, Long> getCallTypeDistribution();

    double getAverageCallDuration();

    Map<String, Object> getUserCallStats(Long userId);

    long getTotalFilesUploaded();

    long getFilesSizeTotal();

    Map<String, Long> getFileTypeDistribution();

    Map<String, Long> getFilesUploadedPerDay(LocalDateTime startDate, LocalDateTime endDate);

    long getCurrentOnlineUsers();

    long getCurrentActiveCalls();

    Map<String, Long> getRealtimeStats();

    double getAverageMessageDeliveryTime();

    double getAverageResponseTime();

    Map<String, Object> getSystemPerformanceMetrics();
}
