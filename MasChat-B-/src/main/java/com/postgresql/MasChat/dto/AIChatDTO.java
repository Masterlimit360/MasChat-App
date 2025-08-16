package com.postgresql.MasChat.dto;

import com.postgresql.MasChat.model.AIChat;
import com.postgresql.MasChat.model.AIChatMessage;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class AIChatDTO {
    private Long id;
    private String sessionId;
    private LocalDateTime createdAt;
    private LocalDateTime lastActivity;
    private Integer messageCount;
    private Boolean isActive;
    private List<AIChatMessageDTO> messages;

    public AIChatDTO() {}

    public AIChatDTO(AIChat aiChat) {
        this.id = aiChat.getId();
        this.sessionId = aiChat.getSessionId();
        this.createdAt = aiChat.getCreatedAt();
        this.lastActivity = aiChat.getLastActivity();
        this.messageCount = aiChat.getMessageCount();
        this.isActive = aiChat.getIsActive();
    }

    public AIChatDTO(AIChat aiChat, List<AIChatMessage> messages) {
        this(aiChat);
        this.messages = messages.stream()
                .map(AIChatMessageDTO::new)
                .collect(Collectors.toList());
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastActivity() {
        return lastActivity;
    }

    public void setLastActivity(LocalDateTime lastActivity) {
        this.lastActivity = lastActivity;
    }

    public Integer getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(Integer messageCount) {
        this.messageCount = messageCount;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public List<AIChatMessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<AIChatMessageDTO> messages) {
        this.messages = messages;
    }
} 