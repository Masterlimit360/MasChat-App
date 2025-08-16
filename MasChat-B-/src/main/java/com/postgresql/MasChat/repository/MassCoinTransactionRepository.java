package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MassCoinTransaction;
import com.postgresql.MasChat.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MassCoinTransactionRepository extends JpaRepository<MassCoinTransaction, Long> {
    
    // Find transactions by user (as sender or recipient)
    @Query("SELECT t FROM MassCoinTransaction t WHERE t.sender = :user OR t.recipient = :user ORDER BY t.createdAt DESC")
    Page<MassCoinTransaction> findByUser(@Param("user") User user, Pageable pageable);
    
    // Find transactions by sender
    List<MassCoinTransaction> findBySenderOrderByCreatedAtDesc(User sender);
    
    // Find transactions by recipient
    List<MassCoinTransaction> findByRecipientOrderByCreatedAtDesc(User recipient);
    
    // Find transactions by type
    List<MassCoinTransaction> findByTransactionTypeOrderByCreatedAtDesc(MassCoinTransaction.TransactionType transactionType);
    
    // Find transactions by status
    List<MassCoinTransaction> findByStatusOrderByCreatedAtDesc(MassCoinTransaction.TransactionStatus status);
    
    // Find pending transactions
    List<MassCoinTransaction> findByStatus(MassCoinTransaction.TransactionStatus status);
    
    // Find transactions by hash
    MassCoinTransaction findByTransactionHash(String transactionHash);
    
    // Find transactions within date range
    @Query("SELECT t FROM MassCoinTransaction t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<MassCoinTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    // Get total amount sent by user
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.sender = :user AND t.status = 'CONFIRMED'")
    BigDecimal getTotalSentByUser(@Param("user") User user);
    
    // Get total amount received by user
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.recipient = :user AND t.status = 'CONFIRMED'")
    BigDecimal getTotalReceivedByUser(@Param("user") User user);
    
    // Get transaction count by user
    @Query("SELECT COUNT(t) FROM MassCoinTransaction t WHERE (t.sender = :user OR t.recipient = :user) AND t.status = 'CONFIRMED'")
    Long getTransactionCountByUser(@Param("user") User user);
    
    // Get recent transactions for user (last 10)
    @Query("SELECT t FROM MassCoinTransaction t WHERE t.sender = :user OR t.recipient = :user ORDER BY t.createdAt DESC")
    List<MassCoinTransaction> findRecentTransactionsByUser(@Param("user") User user, Pageable pageable);
    
    // Get transactions by type for user
    @Query("SELECT t FROM MassCoinTransaction t WHERE (t.sender = :user OR t.recipient = :user) AND t.transactionType = :type ORDER BY t.createdAt DESC")
    List<MassCoinTransaction> findByUserAndType(@Param("user") User user, @Param("type") MassCoinTransaction.TransactionType type);
    
    // Get total volume by transaction type
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.transactionType = :type AND t.status = 'CONFIRMED'")
    BigDecimal getTotalVolumeByType(@Param("type") MassCoinTransaction.TransactionType type);
    
    // Get total platform volume
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.status = 'CONFIRMED'")
    BigDecimal getTotalPlatformVolume();
    
    // Find failed transactions
    List<MassCoinTransaction> findByStatusAndCreatedAtBefore(MassCoinTransaction.TransactionStatus status, LocalDateTime before);
    
    // Get transaction statistics for user
    @Query("SELECT " +
           "COUNT(CASE WHEN t.sender = :user THEN 1 END) as sentCount, " +
           "COUNT(CASE WHEN t.recipient = :user THEN 1 END) as receivedCount, " +
           "COALESCE(SUM(CASE WHEN t.sender = :user THEN t.amount ELSE 0 END), 0) as totalSent, " +
           "COALESCE(SUM(CASE WHEN t.recipient = :user THEN t.amount ELSE 0 END), 0) as totalReceived " +
           "FROM MassCoinTransaction t WHERE (t.sender = :user OR t.recipient = :user) AND t.status = 'CONFIRMED'")
    Object[] getUserTransactionStats(@Param("user") User user);

    Page<MassCoinTransaction> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(Long senderId, Long recipientId, Pageable pageable);
    
    // Count transactions by sender or recipient
    @Query("SELECT COUNT(t) FROM MassCoinTransaction t WHERE t.sender.id = :userId OR t.recipient.id = :userId")
    long countBySenderIdOrRecipientId(@Param("userId") Long userId);
    
    // Get total volume by user ID
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE (t.sender.id = :userId OR t.recipient.id = :userId) AND t.status = 'CONFIRMED'")
    BigDecimal getTotalVolumeByUserId(@Param("userId") Long userId);
    
    // Get average transaction amount by user ID
    @Query("SELECT COALESCE(AVG(t.amount), 0) FROM MassCoinTransaction t WHERE (t.sender.id = :userId OR t.recipient.id = :userId) AND t.status = 'CONFIRMED'")
    BigDecimal getAverageTransactionAmountByUserId(@Param("userId") Long userId);
    
    // Count tips received by user ID
    @Query("SELECT COUNT(t) FROM MassCoinTransaction t WHERE t.recipient.id = :userId AND t.transactionType = :type")
    long countByRecipientIdAndTransactionType(@Param("userId") Long userId, @Param("type") MassCoinTransaction.TransactionType type);
    
    // Get total tips amount received by user ID
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.recipient.id = :userId AND t.transactionType = :type AND t.status = 'CONFIRMED'")
    BigDecimal getTotalTipsAmountReceivedByUserId(@Param("userId") Long userId, @Param("type") MassCoinTransaction.TransactionType type);
    
    // Count tips sent by user ID
    @Query("SELECT COUNT(t) FROM MassCoinTransaction t WHERE t.sender.id = :userId AND t.transactionType = :type")
    long countBySenderIdAndTransactionType(@Param("userId") Long userId, @Param("type") MassCoinTransaction.TransactionType type);
    
    // Get total tips amount sent by user ID
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM MassCoinTransaction t WHERE t.sender.id = :userId AND t.transactionType = :type AND t.status = 'CONFIRMED'")
    BigDecimal getTotalTipsAmountSentByUserId(@Param("userId") Long userId, @Param("type") MassCoinTransaction.TransactionType type);
    
    // Find transactions by sender ID or recipient ID with pagination
    @Query("SELECT t FROM MassCoinTransaction t WHERE t.sender.id = :userId OR t.recipient.id = :userId ORDER BY t.createdAt DESC")
    Page<MassCoinTransaction> findBySenderIdOrRecipientIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
} 