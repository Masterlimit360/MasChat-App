package com.postgresql.MasChat.dto;

import com.postgresql.MasChat.model.AIChatMessage;
import java.time.LocalDateTime;

public class AIChatMessageDTO {
    private Long id;
    private String content;
    private Boolean isUserMessage;
    private LocalDateTime sentAt;
    private Long aiResponseTimeMs;
    private Integer tokensUsed;
    private String modelUsed;
    private String errorMessage;

    public AIChatMessageDTO() {}

    public AIChatMessageDTO(AIChatMessage message) {
        this.id = message.getId();
        this.content = message.getContent();
        this.isUserMessage = message.getIsUserMessage();
        this.sentAt = message.getSentAt();
        this.aiResponseTimeMs = message.getAiResponseTimeMs();
        this.tokensUsed = message.getTokensUsed();
        this.modelUsed = message.getModelUsed();
        this.errorMessage = message.getErrorMessage();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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