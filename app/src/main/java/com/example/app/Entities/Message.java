package com.example.app.Entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "message", indexes = {
        @Index(name = "idx_message_conversation_id_sent_date", columnList = "conversation_id,sent_date DESC"),
        @Index(name = "idx_message_is_deleted", columnList = "is_deleted"),
        @Index(name = "idx_message_sender_id", columnList = "sender_id"),
        @Index(name = "idx_message_is_pinned", columnList = "is_pinned")
})
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    @Enumerated(EnumType.STRING)
    private MessageType type = MessageType.TEXT;

    @Column(name = "sent_date")
    private LocalDateTime sentDate;

    @Column(name = "edited_date")
    private LocalDateTime editedDate;

    @Column(name = "is_edited")
    private Boolean isEdited = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    public Message(Long id, String content, MessageType type, LocalDateTime sentDate, LocalDateTime editedDate, Boolean isEdited, Boolean isDeleted, Boolean isPinned, Conversation conversation, Boolean isRead, User sender, Message replyTo, List<MessageAttachment> attachments, List<MessageStatus> messageStatuses, List<MessageReaction> reactions) {
        this.id = id;
        this.content = content;
        this.type = type;
        this.sentDate = sentDate;
        this.editedDate = editedDate;
        this.isEdited = isEdited;
        this.isDeleted = isDeleted;
        this.isPinned = isPinned;
        this.conversation = conversation;
        this.isRead = isRead;
        this.sender = sender;
        this.replyTo = replyTo;
        this.attachments = attachments;
        this.messageStatuses = messageStatuses;
        this.reactions = reactions;
    }

    public Boolean getRead() {
        return isRead;
    }

    public void setRead(Boolean read) {
        isRead = read;
    }

    @Column(name = "is_read")
    private Boolean isRead = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MessageAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MessageStatus> messageStatuses = new ArrayList<>();

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<MessageReaction> reactions = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.sentDate = LocalDateTime.now();
    }

    public enum MessageType {
        TEXT, IMAGE, VIDEO, AUDIO, VOICE, DOCUMENT, LOCATION, STICKER, GIF, SYSTEM
    }

    // Constructor, getters, setters unchanged
    public Message(Long id, String content, MessageType type, LocalDateTime sentDate, LocalDateTime editedDate, Boolean isEdited, Boolean isDeleted, Boolean isPinned, Conversation conversation, User sender, Message replyTo, List<MessageAttachment> attachments, List<MessageStatus> messageStatuses, List<MessageReaction> reactions) {
        this.id = id;
        this.content = content;
        this.type = type;
        this.sentDate = sentDate;
        this.editedDate = editedDate;
        this.isEdited = isEdited;
        this.isDeleted = isDeleted;
        this.isPinned = isPinned;
        this.conversation = conversation;
        this.sender = sender;
        this.replyTo = replyTo;
        this.attachments = attachments;
        this.messageStatuses = messageStatuses;
        this.reactions = reactions;
    }

    public Message() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public MessageType getType() {
        return type;
    }

    public void setType(MessageType type) {
        this.type = type;
    }

    public LocalDateTime getSentDate() {
        return sentDate;
    }

    public void setSentDate(LocalDateTime sentDate) {
        this.sentDate = sentDate;
    }

    public LocalDateTime getEditedDate() {
        return editedDate;
    }

    public void setEditedDate(LocalDateTime editedDate) {
        this.editedDate = editedDate;
    }

    public Boolean getEdited() {
        return isEdited;
    }

    public void setEdited(Boolean edited) {
        isEdited = edited;
    }

    public Boolean getDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public Boolean getPinned() {
        return isPinned;
    }

    public void setPinned(Boolean pinned) {
        isPinned = pinned;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public Message getReplyTo() {
        return replyTo;
    }

    public void setReplyTo(Message replyTo) {
        this.replyTo = replyTo;
    }

    public List<MessageAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<MessageAttachment> attachments) {
        this.attachments = attachments;
    }

    public List<MessageStatus> getMessageStatuses() {
        return messageStatuses;
    }

    public void setMessageStatuses(List<MessageStatus> messageStatuses) {
        this.messageStatuses = messageStatuses;
    }

    public List<MessageReaction> getReactions() {
        return reactions;
    }

    public void setReactions(List<MessageReaction> reactions) {
        this.reactions = reactions;
    }
}