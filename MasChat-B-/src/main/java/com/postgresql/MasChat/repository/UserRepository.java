package com.postgresql.MasChat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.postgresql.MasChat.model.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByUsernameContainingIgnoreCase(String username);
    
    // Search users by username or fullname
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(@Param("query") String query, @Param("query") String query2);
    
    // findById is inherited from JpaRepository and used for online status updates in WebSocketEventListener
}

