package com.postgresql.MasChat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.postgresql.MasChat.model.Post;
import java.util.List;
import java.time.LocalDateTime;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);
    List<Post> findByContentContainingIgnoreCase(String content);
    
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId ORDER BY p.createdAt DESC")
    List<Post> findTop10ByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND YEAR(p.createdAt) = :year")
    List<Post> findByUserIdAndYear(@Param("userId") Long userId, @Param("year") int year);
    
    @Query("SELECT COUNT(p) FROM Post p WHERE p.user.id = :userId AND p.createdAt >= :after")
    long countByUserIdAndCreatedAtAfter(@Param("userId") Long userId, @Param("after") LocalDateTime after);
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND YEAR(p.createdAt) = :year AND MONTH(p.createdAt) = :month")
    List<Post> findByUserIdAndYearAndMonth(@Param("userId") Long userId, @Param("year") int year, @Param("month") int month);
    
    @Query("SELECT p FROM Post p WHERE p.user.id = :userId AND DAYOFYEAR(p.createdAt) = :dayOfYear")
    List<Post> findByUserIdAndDayOfYear(@Param("userId") Long userId, @Param("dayOfYear") int dayOfYear);
}