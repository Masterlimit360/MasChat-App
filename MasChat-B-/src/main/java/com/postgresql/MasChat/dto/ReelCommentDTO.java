package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;

public class ReelCommentDTO {
    private Long id;
    private Long userId;
    private String username;
    private String profilePicture;
    private String content;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static ReelCommentDTO fromEntity(com.postgresql.MasChat.model.ReelComment comment) {
        if (comment == null) return null;
        ReelCommentDTO dto = new ReelCommentDTO();
        dto.setId(comment.getId());
        dto.setUserId(comment.getUser() != null ? comment.getUser().getId() : null);
        dto.setUsername(comment.getUser() != null ? comment.getUser().getUsername() : null);
        dto.setProfilePicture(comment.getUser() != null ? comment.getUser().getProfilePicture() : null);
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }
} 