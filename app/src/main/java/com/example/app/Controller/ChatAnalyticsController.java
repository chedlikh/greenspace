package com.example.app.Controller;

import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.ChatAnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class ChatAnalyticsController {

    @Autowired
    private ChatAnalyticsService chatAnalyticsService;

    @Autowired
    private UserRepo userRepository; // Inject UserRepository to fetch user ID

    // Get current user ID from JWT
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal().equals("anonymousUser")) {
            throw new IllegalStateException("User not authenticated");
        }
        String username = authentication.getName(); // Get username from JWT
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @GetMapping("/messages/total")
    public ResponseEntity<Long> getTotalMessagesCount() {
        return ResponseEntity.ok(chatAnalyticsService.getTotalMessagesCount());
    }

    @GetMapping("/messages/user")
    public ResponseEntity<Long> getUserMessageCount() {
        return ResponseEntity.ok(chatAnalyticsService.getUserMessageCount(getCurrentUserId()));
    }

    @GetMapping("/messages/conversation/{conversationId}")
    public ResponseEntity<Long> getConversationMessageCount(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatAnalyticsService.getConversationMessageCount(conversationId));
    }

    @GetMapping("/messages/type-distribution")
    public ResponseEntity<Map<String, Long>> getMessageTypeDistribution() {
        return ResponseEntity.ok(chatAnalyticsService.getMessageTypeDistribution());
    }

    @GetMapping("/messages/per-day")
    public ResponseEntity<Map<String, Long>> getMessagesPerDay(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(chatAnalyticsService.getMessagesPerDay(
                LocalDateTime.parse(startDate),
                LocalDateTime.parse(endDate)
        ));
    }

    @GetMapping("/users/active")
    public ResponseEntity<Long> getActiveUsersCount() {
        return ResponseEntity.ok(chatAnalyticsService.getActiveUsersCount());
    }

    @GetMapping("/users/daily-active")
    public ResponseEntity<Long> getDailyActiveUsers(@RequestParam String date) {
        return ResponseEntity.ok(chatAnalyticsService.getDailyActiveUsers(LocalDateTime.parse(date)));
    }

    @GetMapping("/users/monthly-active")
    public ResponseEntity<Long> getMonthlyActiveUsers(
            @RequestParam int year,
            @RequestParam int month
    ) {
        return ResponseEntity.ok(chatAnalyticsService.getMonthlyActiveUsers(year, month));
    }

    @GetMapping("/users/activity")
    public ResponseEntity<Map<String, Long>> getUserActivityStats() {
        return ResponseEntity.ok(chatAnalyticsService.getUserActivityStats(getCurrentUserId()));
    }

    @GetMapping("/conversations/total")
    public ResponseEntity<Long> getTotalConversationsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getTotalConversationsCount());
    }

    @GetMapping("/conversations/group")
    public ResponseEntity<Long> getGroupConversationsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getGroupConversationsCount());
    }

    @GetMapping("/conversations/direct")
    public ResponseEntity<Long> getDirectConversationsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getDirectConversationsCount());
    }

    @GetMapping("/conversations/stats/{conversationId}")
    public ResponseEntity<Map<String, Object>> getConversationStats(@PathVariable Long conversationId) {
        return ResponseEntity.ok(chatAnalyticsService.getConversationStats(conversationId));
    }

    @GetMapping("/calls/total")
    public ResponseEntity<Long> getTotalCallsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getTotalCallsCount());
    }

    @GetMapping("/calls/successful")
    public ResponseEntity<Long> getSuccessfulCallsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getSuccessfulCallsCount());
    }

    @GetMapping("/calls/missed")
    public ResponseEntity<Long> getMissedCallsCount() {
        return ResponseEntity.ok(chatAnalyticsService.getMissedCallsCount());
    }

    @GetMapping("/calls/type-distribution")
    public ResponseEntity<Map<String, Long>> getCallTypeDistribution() {
        return ResponseEntity.ok(chatAnalyticsService.getCallTypeDistribution());
    }

    @GetMapping("/calls/average-duration")
    public ResponseEntity<Double> getAverageCallDuration() {
        return ResponseEntity.ok(chatAnalyticsService.getAverageCallDuration());
    }

    @GetMapping("/calls/user-stats")
    public ResponseEntity<Map<String, Object>> getUserCallStats() {
        return ResponseEntity.ok(chatAnalyticsService.getUserCallStats(getCurrentUserId()));
    }

    @GetMapping("/files/total")
    public ResponseEntity<Long> getTotalFilesUploaded() {
        return ResponseEntity.ok(chatAnalyticsService.getTotalFilesUploaded());
    }

    @GetMapping("/files/size")
    public ResponseEntity<Long> getFilesSizeTotal() {
        return ResponseEntity.ok(chatAnalyticsService.getFilesSizeTotal());
    }

    @GetMapping("/files/type-distribution")
    public ResponseEntity<Map<String, Long>> getFileTypeDistribution() {
        return ResponseEntity.ok(chatAnalyticsService.getFileTypeDistribution());
    }

    @GetMapping("/files/per-day")
    public ResponseEntity<Map<String, Long>> getFilesUploadedPerDay(
            @RequestParam String startDate,
            @RequestParam String endDate
    ) {
        return ResponseEntity.ok(chatAnalyticsService.getFilesUploadedPerDay(
                LocalDateTime.parse(startDate),
                LocalDateTime.parse(endDate)
        ));
    }

    @GetMapping("/users/online")
    public ResponseEntity<Long> getCurrentOnlineUsers() {
        return ResponseEntity.ok(chatAnalyticsService.getCurrentOnlineUsers());
    }

    @GetMapping("/calls/active")
    public ResponseEntity<Long> getCurrentActiveCalls() {
        return ResponseEntity.ok(chatAnalyticsService.getCurrentActiveCalls());
    }

    @GetMapping("/realtime")
    public ResponseEntity<Map<String, Long>> getRealtimeStats() {
        return ResponseEntity.ok(chatAnalyticsService.getRealtimeStats());
    }

    @GetMapping("/performance/message-delivery")
    public ResponseEntity<Double> getAverageMessageDeliveryTime() {
        return ResponseEntity.ok(chatAnalyticsService.getAverageMessageDeliveryTime());
    }

    @GetMapping("/performance/response-time")
    public ResponseEntity<Double> getAverageResponseTime() {
        return ResponseEntity.ok(chatAnalyticsService.getAverageResponseTime());
    }

    @GetMapping("/performance")
    public ResponseEntity<Map<String, Object>> getSystemPerformanceMetrics() {
        return ResponseEntity.ok(chatAnalyticsService.getSystemPerformanceMetrics());
    }
}