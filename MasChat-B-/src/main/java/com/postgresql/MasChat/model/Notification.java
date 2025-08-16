package com.postgresql.MasChat.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Column(name = "related_id")
    private String relatedId; // postId, reelId, chatId, transferRequestId, etc.

    @Column(name = "related_type")
    private String relatedType; // POST, REEL, CHAT, MASS_COIN_TRANSFER, etc.

    @Column(name = "sender_id")
    private Long senderId;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "sender_avatar")
    private String senderAvatar;

    private boolean read = false;

    @Column(name = "deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum NotificationType {
        MESSAGE,
        FRIEND_REQUEST,
        POST_LIKE,
        POST_COMMENT,
        REEL_LIKE,
        REEL_COMMENT,
        MASS_COIN_TRANSFER_REQUEST,
        MASS_COIN_TRANSFER_APPROVED,
        MASS_COIN_TRANSFER_REJECTED,
        MASS_COIN_RECEIVED,
        MASS_COIN_SENT,
        SYSTEM_MESSAGE
    }

    // Constructors
    public Notification() {
        this.createdAt = LocalDateTime.now();
    }

    public Notification(User user, String title, String message, NotificationType notificationType) {
        this();
        this.user = user;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
    }

    public Notification(User user, String title, String message, NotificationType notificationType, String relatedId, String relatedType) {
        this(user, title, message, notificationType);
        this.relatedId = relatedId;
        this.relatedType = relatedType;
    }

    public Notification(User user, String title, String message, NotificationType notificationType, String relatedId, String relatedType, Long senderId, String senderName, String senderAvatar) {
        this(user, title, message, notificationType, relatedId, relatedType);
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public NotificationType getNotificationType() {
        return notificationType;
    }

    public void setNotificationType(NotificationType notificationType) {
        this.notificationType = notificationType;
    }

    public String getRelatedId() {
        return relatedId;
    }

    public void setRelatedId(String relatedId) {
        this.relatedId = relatedId;
    }

    public String getRelatedType() {
        return relatedType;
    }

    public void setRelatedType(String relatedType) {
        this.relatedType = relatedType;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderAvatar() {
        return senderAvatar;
    }

    public void setSenderAvatar(String senderAvatar) {
        this.senderAvatar = senderAvatar;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
        if (read && this.readAt == null) {
            this.readAt = LocalDateTime.now();
        }
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
        if (deleted && this.deletedAt == null) {
            this.deletedAt = LocalDateTime.now();
        }
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getReadAt() {
        return readAt;
    }

    public void setReadAt(LocalDateTime readAt) {
        this.readAt = readAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    // Helper methods
    public void markAsRead() {
        this.setRead(true);
    }

    public void markAsDeleted() {
        this.setDeleted(true);
    }

    public boolean isMassCoinRelated() {
        return notificationType == NotificationType.MASS_COIN_TRANSFER_REQUEST ||
               notificationType == NotificationType.MASS_COIN_TRANSFER_APPROVED ||
               notificationType == NotificationType.MASS_COIN_TRANSFER_REJECTED ||
               notificationType == NotificationType.MASS_COIN_RECEIVED ||
               notificationType == NotificationType.MASS_COIN_SENT;
    }
}
