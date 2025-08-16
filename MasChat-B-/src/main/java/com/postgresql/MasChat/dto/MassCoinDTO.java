package com.postgresql.MasChat.dto;

import com.postgresql.MasChat.model.MassCoinTransaction;
import com.postgresql.MasChat.model.MassCoinTransferRequest;
import com.postgresql.MasChat.model.UserWallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MassCoinDTO {

    public static class WalletInfo {
        private Long id;
        private Long userId;
        private String walletAddress;
        private BigDecimal balance;
        private BigDecimal stakedAmount;
        private BigDecimal totalEarned;
        private BigDecimal totalSpent;
        private String walletType;
        private boolean isActive;
        private LocalDateTime lastSyncAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public WalletInfo() {}

        public WalletInfo(UserWallet wallet) {
            this.id = wallet.getId();
            this.userId = wallet.getUser().getId();
            this.walletAddress = wallet.getWalletAddress();
            this.balance = wallet.getBalance();
            this.stakedAmount = wallet.getStakedAmount();
            this.totalEarned = wallet.getTotalEarned();
            this.totalSpent = wallet.getTotalSpent();
            this.walletType = wallet.getWalletType().name();
            this.isActive = wallet.getIsActive();
            this.lastSyncAt = wallet.getLastSyncAt();
            this.createdAt = wallet.getCreatedAt();
            this.updatedAt = wallet.getUpdatedAt();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getWalletAddress() { return walletAddress; }
        public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }
        public BigDecimal getBalance() { return balance; }
        public void setBalance(BigDecimal balance) { this.balance = balance; }
        public BigDecimal getStakedAmount() { return stakedAmount; }
        public void setStakedAmount(BigDecimal stakedAmount) { this.stakedAmount = stakedAmount; }
        public BigDecimal getTotalEarned() { return totalEarned; }
        public void setTotalEarned(BigDecimal totalEarned) { this.totalEarned = totalEarned; }
        public BigDecimal getTotalSpent() { return totalSpent; }
        public void setTotalSpent(BigDecimal totalSpent) { this.totalSpent = totalSpent; }
        public String getWalletType() { return walletType; }
        public void setWalletType(String walletType) { this.walletType = walletType; }
        public boolean isActive() { return isActive; }
        public void setActive(boolean active) { isActive = active; }
        public LocalDateTime getLastSyncAt() { return lastSyncAt; }
        public void setLastSyncAt(LocalDateTime lastSyncAt) { this.lastSyncAt = lastSyncAt; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class TransferRequest {
        private Long recipientId;
        private BigDecimal amount;
        private String message;
        private MassCoinTransferRequest.ContextType contextType;
        private String contextId;
        private MassCoinTransaction.TransactionType transactionType;

        // Getters and Setters
        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public MassCoinTransferRequest.ContextType getContextType() { return contextType; }
        public void setContextType(MassCoinTransferRequest.ContextType contextType) { this.contextType = contextType; }
        public String getContextId() { return contextId; }
        public void setContextId(String contextId) { this.contextId = contextId; }
        public MassCoinTransaction.TransactionType getTransactionType() { return transactionType; }
        public void setTransactionType(MassCoinTransaction.TransactionType transactionType) { this.transactionType = transactionType; }
    }

    public static class TransferRequestInfo {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private Long recipientId;
        private String recipientName;
        private String recipientAvatar;
        private BigDecimal amount;
        private String message;
        private MassCoinTransferRequest.ContextType contextType;
        private String contextId;
        private MassCoinTransferRequest.RequestStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;

        public TransferRequestInfo() {}

        public TransferRequestInfo(MassCoinTransferRequest request) {
            this.id = request.getId();
            this.senderId = request.getSender().getId();
            this.senderName = request.getSender().getFullName();
            this.senderAvatar = request.getSender().getProfilePicture();
            this.recipientId = request.getRecipient().getId();
            this.recipientName = request.getRecipient().getFullName();
            this.recipientAvatar = request.getRecipient().getProfilePicture();
            this.amount = request.getAmount();
            this.message = request.getMessage();
            this.contextType = request.getContextType();
            this.contextId = request.getContextId();
            this.status = request.getStatus();
            this.createdAt = request.getCreatedAt();
            this.expiresAt = request.getExpiresAt();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderAvatar() { return senderAvatar; }
        public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }
        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
        public String getRecipientAvatar() { return recipientAvatar; }
        public void setRecipientAvatar(String recipientAvatar) { this.recipientAvatar = recipientAvatar; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public MassCoinTransferRequest.ContextType getContextType() { return contextType; }
        public void setContextType(MassCoinTransferRequest.ContextType contextType) { this.contextType = contextType; }
        public String getContextId() { return contextId; }
        public void setContextId(String contextId) { this.contextId = contextId; }
        public MassCoinTransferRequest.RequestStatus getStatus() { return status; }
        public void setStatus(MassCoinTransferRequest.RequestStatus status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getExpiresAt() { return expiresAt; }
        public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    }

    public static class TransactionInfo {
        private Long id;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private Long recipientId;
        private String recipientName;
        private String recipientAvatar;
        private BigDecimal amount;
        private String transactionHash;
        private MassCoinTransaction.TransactionType transactionType;
        private MassCoinTransaction.TransactionStatus status;
        private BigDecimal gasFee;
        private BigDecimal usdValue;
        private String description;
        private LocalDateTime createdAt;

        public TransactionInfo() {}

        public TransactionInfo(MassCoinTransaction transaction) {
            this.id = transaction.getId();
            this.senderId = transaction.getSender() != null ? transaction.getSender().getId() : null;
            this.senderName = transaction.getSender() != null ? transaction.getSender().getFullName() : "System";
            this.senderAvatar = transaction.getSender() != null ? transaction.getSender().getProfilePicture() : null;
            this.recipientId = transaction.getRecipient().getId();
            this.recipientName = transaction.getRecipient().getFullName();
            this.recipientAvatar = transaction.getRecipient().getProfilePicture();
            this.amount = transaction.getAmount();
            this.transactionHash = transaction.getTransactionHash();
            this.transactionType = transaction.getTransactionType();
            this.status = transaction.getStatus();
            this.gasFee = transaction.getGasFee();
            this.usdValue = transaction.getUsdValue();
            this.description = transaction.getDescription();
            this.createdAt = transaction.getCreatedAt();
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderAvatar() { return senderAvatar; }
        public void setSenderAvatar(String senderAvatar) { this.senderAvatar = senderAvatar; }
        public Long getRecipientId() { return recipientId; }
        public void setRecipientId(Long recipientId) { this.recipientId = recipientId; }
        public String getRecipientName() { return recipientName; }
        public void setRecipientName(String recipientName) { this.recipientName = recipientName; }
        public String getRecipientAvatar() { return recipientAvatar; }
        public void setRecipientAvatar(String recipientAvatar) { this.recipientAvatar = recipientAvatar; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getTransactionHash() { return transactionHash; }
        public void setTransactionHash(String transactionHash) { this.transactionHash = transactionHash; }
        public MassCoinTransaction.TransactionType getTransactionType() { return transactionType; }
        public void setTransactionType(MassCoinTransaction.TransactionType transactionType) { this.transactionType = transactionType; }
        public MassCoinTransaction.TransactionStatus getStatus() { return status; }
        public void setStatus(MassCoinTransaction.TransactionStatus status) { this.status = status; }
        public BigDecimal getGasFee() { return gasFee; }
        public void setGasFee(BigDecimal gasFee) { this.gasFee = gasFee; }
        public BigDecimal getUsdValue() { return usdValue; }
        public void setUsdValue(BigDecimal usdValue) { this.usdValue = usdValue; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class WithdrawalRequest {
        private Long userId;
        private BigDecimal amount;
        private String method; // BANK | MOBILE_MONEY | P2P
        private String destination; // account number / wallet / peer username
        private String metadata; // optional JSON string for extra details

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public String getMetadata() { return metadata; }
        public void setMetadata(String metadata) { this.metadata = metadata; }
    }

    public static class WithdrawalInfo {
        private Long id;
        private Long userId;
        private BigDecimal amount;
        private String method;
        private String destination;
        private String status; // PENDING | PROCESSING | COMPLETED | FAILED
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public WithdrawalInfo() {}

        public WithdrawalInfo(com.postgresql.MasChat.model.MassCoinWithdrawal withdrawal) {
            this.id = withdrawal.getId();
            this.userId = withdrawal.getUser().getId();
            this.amount = withdrawal.getAmount();
            this.method = withdrawal.getMethod();
            this.destination = withdrawal.getDestination();
            this.status = withdrawal.getStatus().name();
            this.createdAt = withdrawal.getCreatedAt();
            this.updatedAt = withdrawal.getUpdatedAt();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public BigDecimal getAmount() { return amount; }
        public void setAmount(BigDecimal amount) { this.amount = amount; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class UserStats {
        private Long totalTransactions;
        private BigDecimal totalVolume;
        private BigDecimal averageTransactionAmount;
        private Long totalTipsReceived;
        private BigDecimal totalTipsAmount;
        private Long totalTipsSent;
        private BigDecimal totalTipsSentAmount;

        public UserStats() {}

        // Getters and Setters
        public Long getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(Long totalTransactions) { this.totalTransactions = totalTransactions; }
        public BigDecimal getTotalVolume() { return totalVolume; }
        public void setTotalVolume(BigDecimal totalVolume) { this.totalVolume = totalVolume; }
        public BigDecimal getAverageTransactionAmount() { return averageTransactionAmount; }
        public void setAverageTransactionAmount(BigDecimal averageTransactionAmount) { this.averageTransactionAmount = averageTransactionAmount; }
        public Long getTotalTipsReceived() { return totalTipsReceived; }
        public void setTotalTipsReceived(Long totalTipsReceived) { this.totalTipsReceived = totalTipsReceived; }
        public BigDecimal getTotalTipsAmount() { return totalTipsAmount; }
        public void setTotalTipsAmount(BigDecimal totalTipsAmount) { this.totalTipsAmount = totalTipsAmount; }
        public Long getTotalTipsSent() { return totalTipsSent; }
        public void setTotalTipsSent(Long totalTipsSent) { this.totalTipsSent = totalTipsSent; }
        public BigDecimal getTotalTipsSentAmount() { return totalTipsSentAmount; }
        public void setTotalTipsSentAmount(BigDecimal totalTipsSentAmount) { this.totalTipsSentAmount = totalTipsSentAmount; }
    }

    public static class PlatformStats {
        private Long totalUsers;
        private Long totalWallets;
        private BigDecimal totalCirculatingSupply;
        private BigDecimal totalStakedAmount;
        private Long totalTransactions;
        private BigDecimal totalTransactionVolume;

        public PlatformStats() {}

        // Getters and Setters
        public Long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }
        public Long getTotalWallets() { return totalWallets; }
        public void setTotalWallets(Long totalWallets) { this.totalWallets = totalWallets; }
        public BigDecimal getTotalCirculatingSupply() { return totalCirculatingSupply; }
        public void setTotalCirculatingSupply(BigDecimal totalCirculatingSupply) { this.totalCirculatingSupply = totalCirculatingSupply; }
        public BigDecimal getTotalStakedAmount() { return totalStakedAmount; }
        public void setTotalStakedAmount(BigDecimal totalStakedAmount) { this.totalStakedAmount = totalStakedAmount; }
        public Long getTotalTransactions() { return totalTransactions; }
        public void setTotalTransactions(Long totalTransactions) { this.totalTransactions = totalTransactions; }
        public BigDecimal getTotalTransactionVolume() { return totalTransactionVolume; }
        public void setTotalTransactionVolume(BigDecimal totalTransactionVolume) { this.totalTransactionVolume = totalTransactionVolume; }
    }

    public static class UserSearchResult {
        private Long id;
        private String username;
        private String fullName;
        private String profilePicture;
        private String email;

        public UserSearchResult() {}

        public UserSearchResult(Long id, String username, String fullName, String profilePicture, String email) {
            this.id = id;
            this.username = username;
            this.fullName = fullName;
            this.profilePicture = profilePicture;
            this.email = email;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getProfilePicture() { return profilePicture; }
        public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }
} 