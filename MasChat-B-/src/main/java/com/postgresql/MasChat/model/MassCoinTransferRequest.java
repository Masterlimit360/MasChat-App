package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mass_coin_transfer_requests")
public class MassCoinTransferRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;
    
    @Column(name = "amount", precision = 18, scale = 6, nullable = false)
    private BigDecimal amount;
    
    @Column(name = "message")
    private String message;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "context_type", nullable = false)
    private ContextType contextType;
    
    @Column(name = "context_id")
    private String contextId; // postId, reelId, chatId, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status = RequestStatus.PENDING;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    public enum ContextType {
        POST,
        REEL,
        CHAT,
        DIRECT,
        MASS_COIN_SECTION
    }
    
    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED,
        EXPIRED,
        CANCELLED
    }
    
    // Constructors
    public MassCoinTransferRequest() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusDays(7); // 7 days expiry
    }
    
    public MassCoinTransferRequest(User sender, User recipient, BigDecimal amount, String message, ContextType contextType, String contextId) {
        this();
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.message = message;
        this.contextType = contextType;
        this.contextId = contextId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getSender() {
        return sender;
    }
    
    public void setSender(User sender) {
        this.sender = sender;
    }
    
    public User getRecipient() {
        return recipient;
    }
    
    public void setRecipient(User recipient) {
        this.recipient = recipient;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public ContextType getContextType() {
        return contextType;
    }
    
    public void setContextType(ContextType contextType) {
        this.contextType = contextType;
    }
    
    public String getContextId() {
        return contextId;
    }
    
    public void setContextId(String contextId) {
        this.contextId = contextId;
    }
    
    public RequestStatus getStatus() {
        return status;
    }
    
    public void setStatus(RequestStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }
    
    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 