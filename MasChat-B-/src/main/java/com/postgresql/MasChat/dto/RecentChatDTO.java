package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;

public class RecentChatDTO {
    private Long id;
    private String username;
    private String fullName;
    private String profilePicture;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private long unreadCount;
    private boolean isOnline;

    public RecentChatDTO(Long id, String username, String fullName, String profilePicture, 
                        String lastMessage, LocalDateTime lastMessageTime, long unreadCount, boolean isOnline) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.profilePicture = profilePicture;
        this.lastMessage = lastMessage;
        this.lastMessageTime = lastMessageTime;
        this.unreadCount = unreadCount;
        this.isOnline = isOnline;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }

    public String getLastMessage() { return lastMessage; }
    public void setLastMessage(String lastMessage) { this.lastMessage = lastMessage; }

    public LocalDateTime getLastMessageTime() { return lastMessageTime; }
    public void setLastMessageTime(LocalDateTime lastMessageTime) { this.lastMessageTime = lastMessageTime; }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }
} 