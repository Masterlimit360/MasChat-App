package com.postgresql.MasChat.dto;

public class ChatMessage {
    // senderId and recipientId should be user IDs (as strings) for WebSocket messaging
    private String senderId;
    private String recipientId;
    private String content;
    private String timestamp;

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
    public String getRecipientId() { return recipientId; }
    public void setRecipientId(String recipientId) { this.recipientId = recipientId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
} 