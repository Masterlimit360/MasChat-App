package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "mass_coin_transactions")
public class MassCoinTransaction {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;
    
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;
    
    @Column(name = "amount", precision = 18, scale = 6, nullable = false)
    private BigDecimal amount;
    
    @Column(name = "transaction_hash")
    private String transactionHash;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private TransactionType transactionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TransactionStatus status;
    
    @Column(name = "gas_fee")
    private BigDecimal gasFee;
    
    @Column(name = "usd_value")
    private BigDecimal usdValue;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "block_number")
    private Long blockNumber;
    
    public enum TransactionType {
        P2P_TRANSFER,
        CONTENT_TIP,
        GIFT_PURCHASE,
        MARKETPLACE_PURCHASE,
        SUBSCRIPTION_PAYMENT,
        REWARD_DISTRIBUTION,
        STAKING_REWARD,
        AIRDROP,
        WITHDRAWAL
    }
    
    public enum TransactionStatus {
        PENDING,
        CONFIRMED,
        FAILED,
        CANCELLED
    }
    
    // Constructors
    public MassCoinTransaction() {
        this.createdAt = LocalDateTime.now();
        this.status = TransactionStatus.PENDING;
    }
    
    public MassCoinTransaction(User sender, User recipient, BigDecimal amount, TransactionType transactionType) {
        this();
        this.sender = sender;
        this.recipient = recipient;
        this.amount = amount;
        this.transactionType = transactionType;
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
    
    public String getTransactionHash() {
        return transactionHash;
    }
    
    public void setTransactionHash(String transactionHash) {
        this.transactionHash = transactionHash;
    }
    
    public TransactionType getTransactionType() {
        return transactionType;
    }
    
    public void setTransactionType(TransactionType transactionType) {
        this.transactionType = transactionType;
    }
    
    public TransactionStatus getStatus() {
        return status;
    }
    
    public void setStatus(TransactionStatus status) {
        this.status = status;
    }
    
    public BigDecimal getGasFee() {
        return gasFee;
    }
    
    public void setGasFee(BigDecimal gasFee) {
        this.gasFee = gasFee;
    }
    
    public BigDecimal getUsdValue() {
        return usdValue;
    }
    
    public void setUsdValue(BigDecimal usdValue) {
        this.usdValue = usdValue;
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
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Long getBlockNumber() {
        return blockNumber;
    }
    
    public void setBlockNumber(Long blockNumber) {
        this.blockNumber = blockNumber;
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 