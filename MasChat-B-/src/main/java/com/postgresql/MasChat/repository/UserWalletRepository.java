package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.model.UserWallet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserWalletRepository extends JpaRepository<UserWallet, Long> {
    
    // Find wallet by user
    Optional<UserWallet> findByUser(User user);
    
    // Find wallet by user ID
    Optional<UserWallet> findByUserId(Long userId);
    
    // Find wallet by wallet address
    Optional<UserWallet> findByWalletAddress(String walletAddress);
    
    // Find active wallets
    List<UserWallet> findByIsActiveTrue();
    
    // Find wallets by type
    List<UserWallet> findByWalletType(UserWallet.WalletType walletType);
    
    // Find wallets with balance greater than amount
    List<UserWallet> findByBalanceGreaterThan(BigDecimal amount);
    
    // Find wallets with staked amount greater than amount
    List<UserWallet> findByStakedAmountGreaterThan(BigDecimal amount);
    
    // Get total platform balance
    @Query("SELECT COALESCE(SUM(w.balance), 0) FROM UserWallet w WHERE w.isActive = true")
    BigDecimal getTotalPlatformBalance();
    
    // Get total staked amount
    @Query("SELECT COALESCE(SUM(w.stakedAmount), 0) FROM UserWallet w WHERE w.isActive = true")
    BigDecimal getTotalStakedAmount();
    
    // Get total platform volume (earned + spent)
    @Query("SELECT COALESCE(SUM(w.totalEarned), 0), COALESCE(SUM(w.totalSpent), 0) FROM UserWallet w WHERE w.isActive = true")
    Object[] getTotalPlatformVolume();
    
    // Get top wallets by balance
    @Query("SELECT w FROM UserWallet w WHERE w.isActive = true ORDER BY w.balance DESC")
    List<UserWallet> findTopWalletsByBalance();
    
    // Get top wallets by staked amount
    @Query("SELECT w FROM UserWallet w WHERE w.isActive = true ORDER BY w.stakedAmount DESC")
    List<UserWallet> findTopWalletsByStakedAmount();
    
    // Get wallets with low balance (for notifications)
    @Query("SELECT w FROM UserWallet w WHERE w.balance < :threshold AND w.isActive = true")
    List<UserWallet> findWalletsWithLowBalance(@Param("threshold") BigDecimal threshold);
    
    // Get wallet statistics
    @Query("SELECT " +
           "COUNT(w) as totalWallets, " +
           "COUNT(CASE WHEN w.walletType = 'CUSTODIAL' THEN 1 END) as custodialWallets, " +
           "COUNT(CASE WHEN w.walletType = 'EXTERNAL' THEN 1 END) as externalWallets, " +
           "COUNT(CASE WHEN w.walletType = 'HYBRID' THEN 1 END) as hybridWallets, " +
           "COALESCE(SUM(w.balance), 0) as totalBalance, " +
           "COALESCE(SUM(w.stakedAmount), 0) as totalStaked " +
           "FROM UserWallet w WHERE w.isActive = true")
    Object[] getWalletStatistics();
    
    // Check if wallet exists for user
    boolean existsByUser(User user);
    
    // Check if wallet address is already used
    boolean existsByWalletAddress(String walletAddress);
    
    // Get wallets that need sync (older than specified time)
    @Query("SELECT w FROM UserWallet w WHERE w.lastSyncAt IS NULL OR w.lastSyncAt < :syncThreshold")
    List<UserWallet> findWalletsNeedingSync(@Param("syncThreshold") java.time.LocalDateTime syncThreshold);
} 