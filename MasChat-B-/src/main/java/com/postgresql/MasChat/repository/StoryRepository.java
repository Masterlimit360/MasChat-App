package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.Story;
import com.postgresql.MasChat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.time.LocalDateTime;

public interface StoryRepository extends JpaRepository<Story, Long> {
    List<Story> findByUser(User user);
    List<Story> findByCreatedAtAfter(java.time.LocalDateTime since);
    
    @Query("SELECT COUNT(s) FROM Story s WHERE s.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(s) FROM Story s WHERE s.user.id = :userId AND s.createdAt >= :after")
    long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("after") LocalDateTime after);
    
    @Query("SELECT s FROM Story s WHERE s.user.id = :userId AND YEAR(s.createdAt) = :year")
    List<Story> findByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year);
    
    @Query("SELECT s FROM Story s WHERE s.user.id = :userId AND YEAR(s.createdAt) = :year AND MONTH(s.createdAt) = :month")
    List<Story> findByUserIdAndYearAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT s FROM Story s WHERE s.user.id = :userId AND DAYOFYEAR(s.createdAt) = :dayOfYear")
    List<Story> findByUserIdAndDayOfYear(@Param("userId") Long userId, @Param("dayOfYear") int dayOfYear);
} 