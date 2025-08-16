package com.postgresql.MasChat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.postgresql.MasChat.model.FriendRequest;
import java.util.List;

public interface FriendRepository extends JpaRepository<FriendRequest, Long> {
    
    @Query("SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.receiver.id = :friendId AND fr.status = 'ACCEPTED'")
    long countByFriendId(@Param("friendId") Long friendId);
    
    @Query("SELECT COUNT(fr) FROM FriendRequest fr WHERE fr.sender.id = :userId AND fr.status = 'ACCEPTED'")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender.id = :userId OR fr.receiver.id = :userId")
    List<FriendRequest> findByUserIdOrFriendId(@Param("userId") Long userId);
    
    @Query("SELECT fr FROM FriendRequest fr WHERE (fr.sender.id = :userId OR fr.receiver.id = :friendId) AND fr.status = 'ACCEPTED'")
    List<FriendRequest> findAcceptedFriendship(@Param("userId") Long userId, @Param("friendId") Long friendId);
} 