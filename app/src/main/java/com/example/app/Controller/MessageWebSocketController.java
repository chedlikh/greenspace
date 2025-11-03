package com.example.app.Controller;

import com.example.app.DTOs.*;
import com.example.app.Entities.User;
import com.example.app.Repository.UserRepo;
import com.example.app.Service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Controller
public class MessageWebSocketController {

    @Autowired
    private MessageService messageService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepo userRepository;

    private Long getUserIdFromPrincipal(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalStateException("User not authenticated");
        }
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found in database"));
        return user.getId();
    }

    @MessageMapping("/send")
    public void sendMessage(@Payload SendMessageDTO messageDTO, Principal principal) {
        Long senderId = getUserIdFromPrincipal(principal);
        MessageDTO sentMessage = messageService.sendMessage(messageDTO, senderId);

        // Ensure timestamp is included
        sentMessage.setSentDate(LocalDateTime.now());

        messagingTemplate.convertAndSend("/topic/conversation/" + sentMessage.getConversationId(), sentMessage);
    }

    @MessageMapping("/message/status")
    public void handleStatusUpdate(@Payload StatusUpdateRequest request, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);  // Changed from direct cast to using your method

        MessageStatusDTO status = messageService.updateMessageStatus(
                request.getMessageId(),
                userId,
                request.getStatus()
        );

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + request.getConversationId() + "/status",
                status
        );
    }

    @MessageMapping("/conversation/mark-read")
    public void handleMarkAsRead(@Payload Long conversationId, Principal principal) {
        Long userId = getUserIdFromPrincipal(principal);  // Changed from direct cast to using your method
        List<MessageStatusDTO> statuses = messageService.markConversationAsRead(conversationId, userId);

        statuses.forEach(status ->
                messagingTemplate.convertAndSend(
                        "/topic/conversation/" + conversationId + "/status",
                        status
                )
        );
    }
    @MessageMapping("/reaction")
    public void processMessageReaction(@Payload Map<String, Object> payload, Principal principal) {
        Long messageId = Long.valueOf(payload.get("messageId").toString());
        String emoji = payload.get("emoji").toString();
        boolean add = Boolean.parseBoolean(payload.get("add").toString());
        Long userId = getUserIdFromPrincipal(principal);

        MessageReactionDTO reactionDTO;
        if (add) {
            reactionDTO = messageService.addReaction(messageId, emoji, userId);
        } else {
            messageService.removeReaction(messageId, emoji, userId);
            reactionDTO = new MessageReactionDTO();
            reactionDTO.setMessageId(messageId);
            reactionDTO.setEmoji(emoji);
            reactionDTO.setUser(new UserDTO());
        }
        messagingTemplate.convertAndSend("/topic/conversation/" +
                        messageService.getMessageById(messageId).get().getConversationId() + "/reaction",
                reactionDTO);
    }
}