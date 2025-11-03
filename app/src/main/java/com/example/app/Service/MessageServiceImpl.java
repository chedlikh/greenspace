package com.example.app.Service;

import com.example.app.DTOs.*;
import com.example.app.Entities.*;
import com.example.app.Repository.*;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import static com.example.app.Repository.MessageRepository.logger;

@Service
@Transactional
public class MessageServiceImpl implements MessageService {

    @Autowired
    private MessageRepository messageRepository;
    @Autowired
    private ConversationRepository conversationRepository;
    @Autowired
    private UserRepo userRepository;
    @Autowired
    private MessageStatusRepository messageStatusRepository;
    @Autowired
    private MessageReactionRepository reactionRepository;
    @Autowired
    private FileUploadService fileUploadService;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ChatValidationService validationService;
    @Autowired
    private WebSocketService webSocketService;
    @Autowired
    private MessageAttachmentRepository messageAttachmentRepository;

    @Override
    @Transactional
    public MessageDTO sendMessage(SendMessageDTO messageDTO, Long senderId) {
        logger.info("Sending message to conversation " + messageDTO.getConversationId());
        long startTime = System.currentTimeMillis();

        try {
            validationService.canUserSendMessage(messageDTO.getConversationId(), senderId);
            Conversation conversation = conversationRepository.findById(messageDTO.getConversationId())
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

            Message message = new Message();
            message.setContent(messageDTO.getContent());
            message.setType(messageDTO.getType() != null ? messageDTO.getType() : Message.MessageType.TEXT);
            message.setConversation(conversation);
            if (senderId != null) {
                User sender = userRepository.findById(senderId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                message.setSender(sender);
            }
            if (messageDTO.getReplyToId() != null) {
                Message replyTo = messageRepository.findById(messageDTO.getReplyToId())
                        .orElseThrow(() -> new IllegalArgumentException("Reply-to message not found"));
                message.setReplyTo(replyTo);
            }
            message.setSentDate(LocalDateTime.now());
            message = messageRepository.save(message);

            conversation.setUpdatedDate(LocalDateTime.now());
            conversationRepository.saveAndFlush(conversation);

            MessageDTO result = modelMapper.map(message, MessageDTO.class);
            result.setAttachments(null); // Reduce payload size
            result.setStatuses(null);
            result.setReactions(null);

            logger.info("Message sent in " + (System.currentTimeMillis() - startTime) + "ms");
            return result;
        } catch (Exception e) {
            logger.severe("Error sending message: " + e.getMessage());
            throw e;
        }
    }
    @Override
    public MessageDTO sendTextMessage(Long conversationId, String content, Long senderId) {
        logger.info("Sending text message to conversation " + conversationId);
        long startTime = System.currentTimeMillis();

        try {
            validationService.canUserSendMessage(conversationId, senderId);
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

            Message message = new Message();
            message.setContent(content);
            message.setType(Message.MessageType.TEXT);
            message.setConversation(conversation);
            if (senderId != null) {
                User sender = userRepository.findById(senderId)
                        .orElseThrow(() -> new IllegalArgumentException("User not found"));
                message.setSender(sender);
            }
            message.setSentDate(LocalDateTime.now());
            message = messageRepository.save(message);

            conversation.setUpdatedDate(LocalDateTime.now());
            conversationRepository.saveAndFlush(conversation);

            MessageDTO messageDTO = modelMapper.map(message, MessageDTO.class);
            messageDTO.setAttachments(null); // Reduce payload size
            messageDTO.setStatuses(null);
            messageDTO.setReactions(null);
            webSocketService.broadcastMessage(messageDTO);

            logger.info("Message sent in " + (System.currentTimeMillis() - startTime) + "ms");
            return messageDTO;
        } catch (Exception e) {
            logger.severe("Error sending message: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public MessageDTO sendMediaMessage(Long conversationId, MultipartFile file, Message.MessageType type, Long senderId) throws IOException {
        validationService.canUserSendMessage(conversationId, senderId);
        MessageDTO messageDTO = sendTextMessage(conversationId, "", senderId);
        MessageAttachment.AttachmentType attachmentType = convertToAttachmentType(type);
        fileUploadService.uploadChatFile(file, messageDTO.getId(), attachmentType);
        return messageDTO;
    }

    private MessageAttachment.AttachmentType convertToAttachmentType(Message.MessageType messageType) {
        return switch (messageType) {
            case IMAGE -> MessageAttachment.AttachmentType.IMAGE;
            case VIDEO -> MessageAttachment.AttachmentType.VIDEO;
            case AUDIO -> MessageAttachment.AttachmentType.AUDIO;
            case VOICE -> MessageAttachment.AttachmentType.VOICE;
            case DOCUMENT -> MessageAttachment.AttachmentType.DOCUMENT;
            case STICKER -> MessageAttachment.AttachmentType.STICKER;
            case GIF -> MessageAttachment.AttachmentType.GIF;
            case TEXT, LOCATION, SYSTEM -> throw new IllegalArgumentException(messageType + " is not a valid attachment type");
            default -> throw new IllegalArgumentException("Unknown message type: " + messageType);
        };
    }

    @Override
    public MessageDTO sendVoiceMessage(Long conversationId, MultipartFile voiceFile, Long senderId) throws IOException {
        return sendMediaMessage(conversationId, voiceFile, Message.MessageType.VOICE, senderId);
    }

    @Override
    public MessageDTO sendLocationMessage(Long conversationId, String location, Long senderId) {
        SendMessageDTO sendDTO = new SendMessageDTO();
        sendDTO.setConversationId(conversationId);
        sendDTO.setContent(location);
        sendDTO.setType(Message.MessageType.LOCATION);
        return sendMessage(sendDTO, senderId);
    }

    @Override
    public Optional<MessageDTO> getMessageById(Long messageId) {
        return messageRepository.findById(messageId)
                .map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public Page<MessageDTO> getConversationMessages(Long conversationId, Pageable pageable) {
        return messageRepository.findByConversationIdOrderBySentDateDesc(conversationId, pageable)
                .map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public List<MessageDTO> getRecentMessages(Long conversationId, int limit) {
        return messageRepository.findByConversationIdOrderBySentDateDesc(conversationId, Pageable.ofSize(limit))
                .getContent()
                .stream()
                .map(msg -> modelMapper.map(msg, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public void markMessageAsDelivered(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MessageStatus status = messageStatusRepository.findByMessageIdAndUserId(messageId, userId)
                .orElseGet(() -> {
                    MessageStatus newStatus = new MessageStatus();
                    newStatus.setMessage(message);
                    newStatus.setUser(user);
                    return newStatus;
                });
        status.setStatus(MessageStatus.Status.DELIVERED);
        status.setStatusDate(LocalDateTime.now());
        messageStatusRepository.save(status);

        webSocketService.notifyMessageDelivered(messageId, userId);
    }

    @Override
    public void markMessageAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MessageStatus status = messageStatusRepository.findByMessageIdAndUserId(messageId, userId)
                .orElseGet(() -> {
                    MessageStatus newStatus = new MessageStatus();
                    newStatus.setMessage(message);
                    newStatus.setUser(user);
                    return newStatus;
                });
        status.setStatus(MessageStatus.Status.READ);
        status.setStatusDate(LocalDateTime.now());
        messageStatusRepository.save(status);

        webSocketService.notifyMessageRead(messageId, userId);
    }

    @Override
    public void markConversationMessagesAsRead(Long conversationId, Long userId) {
        List<MessageStatus> statuses = messageStatusRepository.findUnreadMessages(conversationId, userId);
        statuses.forEach(status -> {
            status.setStatus(MessageStatus.Status.READ);
            status.setStatusDate(LocalDateTime.now());
            messageStatusRepository.save(status);
            webSocketService.notifyMessageRead(status.getMessage().getId(), userId);
        });
    }

    @Override
    public List<MessageDTO> getUnreadMessages(Long userId) {
        return messageStatusRepository.findUnreadMessages(null, userId)
                .stream()
                .map(status -> modelMapper.map(status.getMessage(), MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public int getUnreadMessagesCount(Long conversationId, Long userId) {
        return messageStatusRepository.countUnreadByConversationAndUser(conversationId, userId).intValue();
    }

    @Override
    public MessageDTO editMessage(Long messageId, String newContent, Long userId) {
        validationService.canUserEditMessage(messageId, userId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setContent(newContent);
        message.setEdited(true);
        message.setEditedDate(LocalDateTime.now());
        message = messageRepository.save(message);

        MessageDTO messageDTO = modelMapper.map(message, MessageDTO.class);
        webSocketService.broadcastMessage(messageDTO);
        return messageDTO;
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        validationService.canUserDeleteMessage(messageId, userId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setDeleted(true);
        messageRepository.save(message);

        MessageDTO messageDTO = modelMapper.map(message, MessageDTO.class);
        webSocketService.broadcastMessage(messageDTO);
    }

    @Override
    public void deleteMessageForEveryone(Long messageId, Long userId) {
        deleteMessage(messageId, userId);
    }

    @Override
    public MessageDTO replyToMessage(Long originalMessageId, String content, Long senderId) {
        SendMessageDTO sendDTO = new SendMessageDTO();
        sendDTO.setContent(content);
        sendDTO.setType(Message.MessageType.TEXT);
        sendDTO.setReplyToId(originalMessageId);
        Message originalMessage = messageRepository.findById(originalMessageId)
                .orElseThrow(() -> new IllegalArgumentException("Original message not found"));
        sendDTO.setConversationId(originalMessage.getConversation().getId());
        return sendMessage(sendDTO, senderId);
    }

    @Override
    public List<MessageDTO> getMessageReplies(Long messageId) {
        Message parent = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        return messageRepository.findByReplyTo(parent)
                .stream()
                .map(msg -> modelMapper.map(msg, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<MessageDTO> forwardMessages(List<Long> messageIds, Long targetConversationId, Long userId) {
        validationService.canUserSendMessage(targetConversationId, userId);
        return messageIds.stream()
                .map(messageId -> {
                    Message original = messageRepository.findById(messageId)
                            .orElseThrow(() -> new IllegalArgumentException("Message not found"));
                    SendMessageDTO sendDTO = new SendMessageDTO();
                    sendDTO.setContent(original.getContent());
                    sendDTO.setType(original.getType());
                    sendDTO.setConversationId(targetConversationId);
                    return sendMessage(sendDTO, userId);
                })
                .collect(Collectors.toList());
    }

    @Override
    public Page<MessageDTO> searchMessages(MessageSearchDTO searchDTO) {
        return messageRepository.searchMessagesInConversation(
                searchDTO.getConversationId(),
                searchDTO.getQuery(),
                Pageable.ofSize(searchDTO.getSize()).withPage(searchDTO.getPage())
        ).map(msg -> modelMapper.map(msg, MessageDTO.class));
    }

    @Override
    public List<MessageDTO> searchMessagesInConversation(Long conversationId, String query, Pageable pageable) {
        return messageRepository.searchMessagesInConversation(conversationId, query, pageable)
                .getContent()
                .stream()
                .map(msg -> modelMapper.map(msg, MessageDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public MessageAttachmentDTO uploadAttachment(MultipartFile file, Long messageId) {
        try {
            String filePath = fileUploadService.uploadChatFile(file, messageId, MessageAttachment.AttachmentType.DOCUMENT);
            MessageAttachment attachment = messageAttachmentRepository.findByFilePath(filePath)
                    .orElseThrow(() -> new IllegalArgumentException("Attachment not found for file path: " + filePath));
            return modelMapper.map(attachment, MessageAttachmentDTO.class);
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload attachment", e);
        }
    }

    @Override
    public List<MessageAttachmentDTO> getMessageAttachments(Long messageId) {
        return messageRepository.findById(messageId)
                .map(msg -> msg.getAttachments().stream()
                        .map(att -> modelMapper.map(att, MessageAttachmentDTO.class))
                        .collect(Collectors.toList()))
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
    }

    @Override
    public void deleteAttachment(Long attachmentId, Long userId) {
        MessageAttachment attachment = messageAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        validationService.canUserDeleteMessage(attachment.getMessage().getId(), userId);
        fileUploadService.deleteFile(attachment.getFilePath());
        messageAttachmentRepository.delete(attachment);
    }

    @Override
    public MessageReactionDTO addReaction(Long messageId, String emoji, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        MessageReaction reaction = reactionRepository.findByMessageIdAndUserId(messageId, userId)
                .orElseGet(() -> {
                    MessageReaction newReaction = new MessageReaction();
                    newReaction.setMessage(message);
                    newReaction.setUser(user);
                    return newReaction;
                });
        reaction.setEmoji(emoji);
        reaction.setCreatedDate(LocalDateTime.now());
        reaction = reactionRepository.save(reaction);

        MessageReactionDTO reactionDTO = modelMapper.map(reaction, MessageReactionDTO.class);
        webSocketService.broadcastMessageReaction(message.getConversation().getId(), reactionDTO);
        return reactionDTO;
    }

    @Override
    public void removeReaction(Long messageId, String emoji, Long userId) {
        MessageReaction reaction = reactionRepository.findByMessageIdAndUserId(messageId, userId)
                .filter(r -> r.getEmoji().equals(emoji))
                .orElseThrow(() -> new IllegalArgumentException("Reaction not found"));
        reactionRepository.delete(reaction);

        MessageReactionDTO reactionDTO = modelMapper.map(reaction, MessageReactionDTO.class);
        webSocketService.broadcastMessageReaction(reaction.getMessage().getConversation().getId(), reactionDTO);
    }

    @Override
    public List<MessageReactionDTO> getMessageReactions(Long messageId) {
        return reactionRepository.findByMessageId(messageId)
                .stream()
                .map(r -> modelMapper.map(r, MessageReactionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public MessageDTO sendSystemMessage(Long conversationId, String content) {
        SendMessageDTO sendDTO = new SendMessageDTO();
        sendDTO.setConversationId(conversationId);
        sendDTO.setContent(content);
        sendDTO.setType(Message.MessageType.SYSTEM);
        return sendMessage(sendDTO, null);
    }

    @Override
    public boolean canUserAccessMessage(Long messageId, Long userId) {
        return messageRepository.findById(messageId)
                .map(msg -> validationService.canUserAccessConversation(msg.getConversation().getId(), userId))
                .orElse(false);
    }

    @Override
    public boolean canUserEditMessage(Long messageId, Long userId) {
        return messageRepository.findById(messageId)
                .map(msg -> msg.getSender().getId().equals(userId) && !msg.getDeleted())
                .orElse(false);
    }
    @Override
    public MessageStatusDTO updateMessageStatus(Long messageId, Long userId, MessageStatus.Status status) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Use your existing repository method
        MessageStatus messageStatus = messageStatusRepository.findByMessageAndUser(message, user)
                .orElseGet(() -> {
                    MessageStatus newStatus = new MessageStatus();
                    newStatus.setMessage(message);
                    newStatus.setUser(user);
                    return messageStatusRepository.save(newStatus);
                });

        messageStatus.setStatus(status);
        messageStatus = messageStatusRepository.save(messageStatus);

        // Update message's read status if needed
        if (status == MessageStatus.Status.READ) {
            message.setRead(true);
            messageRepository.save(message);
        }

        return convertToDto(messageStatus);
    }

    @Override
    public List<MessageStatusDTO> markConversationAsRead(Long conversationId, Long userId) {
        // Use your existing repository method
        List<Message> unreadMessages = messageRepository.findUnreadMessagesForUser(conversationId, userId);

        return unreadMessages.stream()
                .map(message -> updateMessageStatus(message.getId(), userId, MessageStatus.Status.READ))
                .collect(Collectors.toList());
    }

    @Override
    public int getUnreadCount(Long conversationId, Long userId) {
        return messageRepository.findUnreadMessagesForUser(conversationId, userId).size();
    }

    private MessageStatusDTO convertToDto(MessageStatus status) {
        MessageStatusDTO dto = new MessageStatusDTO();
        dto.setId(status.getId());
        dto.setMessageId(status.getMessage().getId());
        dto.setUserId(status.getUser().getId());
        dto.setStatus(status.getStatus());
        dto.setStatusDate(status.getStatusDate());
        return dto;
    }
    @Override
    public boolean canUserDeleteMessage(Long messageId, Long userId) {
        return canUserEditMessage(messageId, userId);
    }
}