package com.example.app.Entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "typing_indicators")
public class TypingIndicator {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "is_typing")
    private Boolean isTyping = false;

    @Column(name = "last_typing_date")
    private LocalDateTime lastTypingDate;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.lastTypingDate = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Conversation getConversation() {
        return conversation;
    }

    public void setConversation(Conversation conversation) {
        this.conversation = conversation;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Boolean getTyping() {
        return isTyping;
    }

    public void setTyping(Boolean typing) {
        isTyping = typing;
    }

    public LocalDateTime getLastTypingDate() {
        return lastTypingDate;
    }

    public void setLastTypingDate(LocalDateTime lastTypingDate) {
        this.lastTypingDate = lastTypingDate;
    }

    public TypingIndicator(Long id, Conversation conversation, User user, Boolean isTyping, LocalDateTime lastTypingDate) {
        this.id = id;
        this.conversation = conversation;
        this.user = user;
        this.isTyping = isTyping;
        this.lastTypingDate = lastTypingDate;
    }

    public TypingIndicator() {
    }
}

