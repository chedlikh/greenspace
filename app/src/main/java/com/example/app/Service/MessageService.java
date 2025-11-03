package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.Message;
import com.example.app.Entities.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface MessageService {
    MessageDTO sendMessage(SendMessageDTO sendDTO, Long senderId);
    MessageDTO sendTextMessage(Long conversationId, String content, Long senderId);
    MessageDTO sendMediaMessage(Long conversationId, MultipartFile file, Message.MessageType type, Long senderId) throws IOException;
    MessageDTO sendVoiceMessage(Long conversationId, MultipartFile voiceFile, Long senderId) throws IOException;
    MessageDTO sendLocationMessage(Long conversationId, String location, Long senderId);
    Optional<MessageDTO> getMessageById(Long messageId);
    Page<MessageDTO> getConversationMessages(Long conversationId, Pageable pageable);
    List<MessageDTO> getRecentMessages(Long conversationId, int limit);
    void markMessageAsDelivered(Long messageId, Long userId);
    void markMessageAsRead(Long messageId, Long userId);
    void markConversationMessagesAsRead(Long conversationId, Long userId);
    List<MessageDTO> getUnreadMessages(Long userId);
    int getUnreadMessagesCount(Long conversationId, Long userId);
    MessageDTO editMessage(Long messageId, String newContent, Long userId);
    void deleteMessage(Long messageId, Long userId);
    void deleteMessageForEveryone(Long messageId, Long userId);
    MessageDTO replyToMessage(Long originalMessageId, String content, Long senderId);
    List<MessageDTO> getMessageReplies(Long messageId);
    List<MessageDTO> forwardMessages(List<Long> messageIds, Long targetConversationId, Long userId);
    Page<MessageDTO> searchMessages(MessageSearchDTO searchDTO);
    List<MessageDTO> searchMessagesInConversation(Long conversationId, String query, Pageable pageable);
    MessageAttachmentDTO uploadAttachment(MultipartFile file, Long messageId);
    List<MessageAttachmentDTO> getMessageAttachments(Long messageId);
    void deleteAttachment(Long attachmentId, Long userId);
    MessageReactionDTO addReaction(Long messageId, String emoji, Long userId);
    void removeReaction(Long messageId, String emoji, Long userId);
    List<MessageReactionDTO> getMessageReactions(Long messageId);
    MessageDTO sendSystemMessage(Long conversationId, String content);
    boolean canUserAccessMessage(Long messageId, Long userId);
    boolean canUserEditMessage(Long messageId, Long userId);

    MessageStatusDTO updateMessageStatus(Long messageId, Long userId, MessageStatus.Status status);

    List<MessageStatusDTO> markConversationAsRead(Long conversationId, Long userId);

    int getUnreadCount(Long conversationId, Long userId);

    boolean canUserDeleteMessage(Long messageId, Long userId);
}
