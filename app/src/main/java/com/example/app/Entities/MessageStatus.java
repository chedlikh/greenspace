package com.example.app.Entities;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity

@Table(name = "message_status")
public class MessageStatus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SENT;

    @Column(name = "status_date")
    private LocalDateTime statusDate;

    @PrePersist
    protected void onCreate() {
        this.statusDate = LocalDateTime.now();
    }

    public enum Status {
        SENT, DELIVERED, READ
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Message getMessage() {
        return message;
    }

    public void setMessage(Message message) {
        this.message = message;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getStatusDate() {
        return statusDate;
    }

    public void setStatusDate(LocalDateTime statusDate) {
        this.statusDate = statusDate;
    }

    public MessageStatus() {
    }

    public MessageStatus(Long id, Message message, User user, Status status, LocalDateTime statusDate) {
        this.id = id;
        this.message = message;
        this.user = user;
        this.status = status;
        this.statusDate = statusDate;
    }
}
