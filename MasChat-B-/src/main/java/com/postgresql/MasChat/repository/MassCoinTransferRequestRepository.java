package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MassCoinTransferRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MassCoinTransferRequestRepository extends JpaRepository<MassCoinTransferRequest, Long> {
    
    // Find pending requests for a recipient
    List<MassCoinTransferRequest> findByRecipientIdAndStatusOrderByCreatedAtDesc(Long recipientId, MassCoinTransferRequest.RequestStatus status);
    
    // Find requests sent by a user
    List<MassCoinTransferRequest> findBySenderIdOrderByCreatedAtDesc(Long senderId);
    
    // Find requests received by a user
    List<MassCoinTransferRequest> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    
    // Find requests by context (post, reel, chat, etc.)
    List<MassCoinTransferRequest> findByContextTypeAndContextIdAndStatusOrderByCreatedAtDesc(
        MassCoinTransferRequest.ContextType contextType, 
        String contextId, 
        MassCoinTransferRequest.RequestStatus status
    );
    
    // Find expired requests
    @Query("SELECT r FROM MassCoinTransferRequest r WHERE r.expiresAt < :now AND r.status = 'PENDING'")
    List<MassCoinTransferRequest> findExpiredRequests(@Param("now") LocalDateTime now);
    
    // Find request by sender and recipient with specific context
    Optional<MassCoinTransferRequest> findBySenderIdAndRecipientIdAndContextTypeAndContextIdAndStatus(
        Long senderId, 
        Long recipientId, 
        MassCoinTransferRequest.ContextType contextType, 
        String contextId, 
        MassCoinTransferRequest.RequestStatus status
    );
    
    // Count pending requests for a recipient
    long countByRecipientIdAndStatus(Long recipientId, MassCoinTransferRequest.RequestStatus status);
    
    // Find requests that need to be expired
    @Query("SELECT r FROM MassCoinTransferRequest r WHERE r.expiresAt < :now AND r.status = 'PENDING'")
    List<MassCoinTransferRequest> findRequestsToExpire(@Param("now") LocalDateTime now);
} 