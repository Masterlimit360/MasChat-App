package com.postgresql.MasChat.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.postgresql.MasChat.model.FriendRequest;
import com.postgresql.MasChat.model.User;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {
    List<FriendRequest> findByReceiverAndStatus(User receiver, String status);
    List<FriendRequest> findBySenderAndStatus(User sender, String status);
    List<FriendRequest> findBySenderId(Long senderId);
    List<FriendRequest> findByReceiverId(Long receiverId);
    List<FriendRequest> findByReceiverIdAndStatus(Long receiverId, String status);
    
    // Find requests between specific sender and receiver
    @Query("SELECT fr FROM FriendRequest fr WHERE fr.sender.id = :senderId AND fr.receiver.id = :receiverId")
    List<FriendRequest> findBySenderIdAndReceiverId(@Param("senderId") Long senderId, @Param("receiverId") Long receiverId);
}