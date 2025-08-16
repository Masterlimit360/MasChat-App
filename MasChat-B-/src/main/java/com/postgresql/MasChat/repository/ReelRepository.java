package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.Reel;
import com.postgresql.MasChat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface ReelRepository extends JpaRepository<Reel, Long> {
    List<Reel> findByUser(User user);
    List<Reel> findByCreatedAtAfter(java.time.LocalDateTime since);
    List<Reel> findByCaptionContainingIgnoreCase(String caption);
    
    @Query("SELECT COUNT(r) FROM Reel r WHERE r.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(r) FROM Reel r WHERE r.user.id = :userId AND r.createdAt >= :after")
    long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("after") LocalDateTime after);
    
    @Query("SELECT r FROM Reel r WHERE r.user.id = :userId AND YEAR(r.createdAt) = :year")
    List<Reel> findByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year);
    
    @Query("SELECT r FROM Reel r WHERE r.user.id = :userId AND YEAR(r.createdAt) = :year AND MONTH(r.createdAt) = :month")
    List<Reel> findByUserIdAndYearAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT r FROM Reel r WHERE r.user.id = :userId AND DAYOFYEAR(r.createdAt) = :dayOfYear")
    List<Reel> findByUserIdAndDayOfYear(@Param("userId") Long userId, @Param("dayOfYear") int dayOfYear);
} 