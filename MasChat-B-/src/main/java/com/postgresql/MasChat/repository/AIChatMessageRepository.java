package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.AIChat;
import com.postgresql.MasChat.model.AIChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIChatMessageRepository extends JpaRepository<AIChatMessage, Long> {
    
    List<AIChatMessage> findByAiChatOrderBySentAtAsc(AIChat aiChat);
    
    List<AIChatMessage> findByAiChatAndIsUserMessageOrderBySentAtAsc(AIChat aiChat, Boolean isUserMessage);
    
    @Query("SELECT acm FROM AIChatMessage acm WHERE acm.aiChat = :aiChat ORDER BY acm.sentAt ASC")
    List<AIChatMessage> findConversationHistory(@Param("aiChat") AIChat aiChat);
    
    @Query("SELECT COUNT(acm) FROM AIChatMessage acm WHERE acm.aiChat = :aiChat AND acm.isUserMessage = true")
    Long countUserMessages(@Param("aiChat") AIChat aiChat);
    
    @Query("SELECT COUNT(acm) FROM AIChatMessage acm WHERE acm.aiChat = :aiChat AND acm.isUserMessage = false")
    Long countAIMessages(@Param("aiChat") AIChat aiChat);
    
    @Query("SELECT acm FROM AIChatMessage acm WHERE acm.aiChat = :aiChat ORDER BY acm.sentAt DESC")
    List<AIChatMessage> findRecentMessages(@Param("aiChat") AIChat aiChat);
} 