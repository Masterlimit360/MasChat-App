package com.postgresql.MasChat.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.postgresql.MasChat.model.Message;
import com.postgresql.MasChat.model.User;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findBySenderAndRecipientOrSenderAndRecipientOrderBySentAt(
        User sender1, User recipient1, User sender2, User recipient2
    );
    
    // Get all messages for a user (sent or received)
    @Query("SELECT m FROM Message m WHERE m.sender.id = :userId OR m.recipient.id = :userId ORDER BY m.sentAt DESC")
    List<Message> findBySenderIdOrRecipientIdOrderBySentAtDesc(@Param("userId") Long userId);
    
    // Get messages between two users
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.recipient.id = :userId2) OR (m.sender.id = :userId2 AND m.recipient.id = :userId1) ORDER BY m.sentAt DESC")
    List<Message> findConversationBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
    
    // Get unread messages from a specific sender to a recipient
    @Query("SELECT m FROM Message m WHERE m.recipient.id = :recipientId AND m.sender.id = :senderId AND m.read = false")
    List<Message> findByRecipientIdAndSenderIdAndReadFalse(@Param("recipientId") Long recipientId, @Param("senderId") Long senderId);
}
