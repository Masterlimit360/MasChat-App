package com.postgresql.MasChat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.postgresql.MasChat.model.Comment;
import com.postgresql.MasChat.model.Post;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByPost(Post post);
    
    // Get only top-level comments (no parent)
    @Query("SELECT c FROM Comment c WHERE c.post = :post AND c.parentComment IS NULL ORDER BY c.createdAt DESC")
    List<Comment> findTopLevelCommentsByPost(@Param("post") Post post);
    
    // Get replies for a specific comment
    @Query("SELECT c FROM Comment c WHERE c.parentComment.id = :parentCommentId ORDER BY c.createdAt ASC")
    List<Comment> findRepliesByParentCommentId(@Param("parentCommentId") Long parentCommentId);
    
    // Search comments by content
    @Query("SELECT c FROM Comment c WHERE c.post = :post AND LOWER(c.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')) ORDER BY c.createdAt DESC")
    List<Comment> searchCommentsByContent(@Param("post") Post post, @Param("searchTerm") String searchTerm);
    
    // Get comments by user
    @Query("SELECT c FROM Comment c WHERE c.user.id = :userId ORDER BY c.createdAt DESC")
    List<Comment> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT c FROM Comment c WHERE c.post.user.id = :postUserId ORDER BY c.createdAt DESC")
    List<Comment> findTop10ByPostUserIdOrderByCreatedAtDesc(@Param("postUserId") Long postUserId);
    
    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post.user.id = :postUserId")
    long countByPostUserId(@Param("postUserId") Long postUserId);
}
