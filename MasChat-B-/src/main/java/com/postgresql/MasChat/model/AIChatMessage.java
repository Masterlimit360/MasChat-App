package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_chat_messages")
public class AIChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ai_chat_id", nullable = false)
    private AIChat aiChat;

    @Column(name = "content", nullable = false, length = 4000)
    private String content;

    @Column(name = "is_user_message", nullable = false)
    private Boolean isUserMessage;

    @Column(name = "sent_at", nullable = false)
    private LocalDateTime sentAt;

    @Column(name = "ai_response_time_ms")
    private Long aiResponseTimeMs;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @Column(name = "model_used")
    private String modelUsed;

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        this.sentAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AIChat getAiChat() {
        return aiChat;
    }

    public void setAiChat(AIChat aiChat) {
        this.aiChat = aiChat;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Boolean getIsUserMessage() {
        return isUserMessage;
    }

    public void setIsUserMessage(Boolean isUserMessage) {
        this.isUserMessage = isUserMessage;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public Long getAiResponseTimeMs() {
        return aiResponseTimeMs;
    }

    public void setAiResponseTimeMs(Long aiResponseTimeMs) {
        this.aiResponseTimeMs = aiResponseTimeMs;
    }

    public Integer getTokensUsed() {
        return tokensUsed;
    }

    public void setTokensUsed(Integer tokensUsed) {
        this.tokensUsed = tokensUsed;
    }

    public String getModelUsed() {
        return modelUsed;
    }

    public void setModelUsed(String modelUsed) {
        this.modelUsed = modelUsed;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
} 