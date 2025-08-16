package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_wallets")
public class UserWallet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "wallet_address", unique = true)
    private String walletAddress;
    
    @Column(name = "balance", precision = 18, scale = 6, nullable = false)
    private BigDecimal balance = BigDecimal.ZERO;
    
    @Column(name = "staked_amount", precision = 18, scale = 6, nullable = false)
    private BigDecimal stakedAmount = BigDecimal.ZERO;
    
    @Column(name = "total_earned", precision = 18, scale = 6, nullable = false)
    private BigDecimal totalEarned = BigDecimal.ZERO;
    
    @Column(name = "total_spent", precision = 18, scale = 6, nullable = false)
    private BigDecimal totalSpent = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "wallet_type", nullable = false)
    private WalletType walletType = WalletType.CUSTODIAL;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Column(name = "last_sync_at")
    private LocalDateTime lastSyncAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public enum WalletType {
        CUSTODIAL,      // MasChat managed wallet
        EXTERNAL,       // User's own wallet (MetaMask, etc.)
        HYBRID          // Both custodial and external
    }
    
    // Constructors
    public UserWallet() {
        this.createdAt = LocalDateTime.now();
    }
    
    public UserWallet(User user) {
        this();
        this.user = user;
    }
    
    public UserWallet(User user, String walletAddress, WalletType walletType) {
        this(user);
        this.walletAddress = walletAddress;
        this.walletType = walletType;
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
    
    public String getWalletAddress() {
        return walletAddress;
    }
    
    public void setWalletAddress(String walletAddress) {
        this.walletAddress = walletAddress;
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
    
    public BigDecimal getStakedAmount() {
        return stakedAmount;
    }
    
    public void setStakedAmount(BigDecimal stakedAmount) {
        this.stakedAmount = stakedAmount;
    }
    
    public BigDecimal getTotalEarned() {
        return totalEarned;
    }
    
    public void setTotalEarned(BigDecimal totalEarned) {
        this.totalEarned = totalEarned;
    }
    
    public BigDecimal getTotalSpent() {
        return totalSpent;
    }
    
    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }
    
    public WalletType getWalletType() {
        return walletType;
    }
    
    public void setWalletType(WalletType walletType) {
        this.walletType = walletType;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
    
    public LocalDateTime getLastSyncAt() {
        return lastSyncAt;
    }
    
    public void setLastSyncAt(LocalDateTime lastSyncAt) {
        this.lastSyncAt = lastSyncAt;
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
    
    // Helper methods
    public BigDecimal getTotalBalance() {
        return balance.add(stakedAmount);
    }
    
    public void addBalance(BigDecimal amount) {
        this.balance = this.balance.add(amount);
        this.totalEarned = this.totalEarned.add(amount);
    }
    
    public void subtractBalance(BigDecimal amount) {
        this.balance = this.balance.subtract(amount);
        this.totalSpent = this.totalSpent.add(amount);
    }
    
    public void stake(BigDecimal amount) {
        if (this.balance.compareTo(amount) >= 0) {
            this.balance = this.balance.subtract(amount);
            this.stakedAmount = this.stakedAmount.add(amount);
        }
    }
    
    public void unstake(BigDecimal amount) {
        if (this.stakedAmount.compareTo(amount) >= 0) {
            this.stakedAmount = this.stakedAmount.subtract(amount);
            this.balance = this.balance.add(amount);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 