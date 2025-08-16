package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.AIChat;
import com.postgresql.MasChat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AIChatRepository extends JpaRepository<AIChat, Long> {
    
    List<AIChat> findByUserOrderByLastActivityDesc(User user);
    
    List<AIChat> findByUserAndIsActiveTrueOrderByLastActivityDesc(User user);
    
    Optional<AIChat> findBySessionId(String sessionId);
    
    Optional<AIChat> findByUserAndSessionId(User user, String sessionId);
    
    @Query("SELECT ac FROM AIChat ac WHERE ac.user = :user AND ac.lastActivity > :cutoffDate ORDER BY ac.lastActivity DESC")
    List<AIChat> findRecentChatsByUser(@Param("user") User user, @Param("cutoffDate") java.time.LocalDateTime cutoffDate);
    
    @Query("SELECT COUNT(ac) FROM AIChat ac WHERE ac.user = :user AND ac.createdAt >= :startDate")
    Long countChatsByUserSince(@Param("user") User user, @Param("startDate") java.time.LocalDateTime startDate);
} 