package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class CommentDTO {
    private Long id;
    private Long userId;
    private String username;
    private String profilePicture;
    private String content;
    private LocalDateTime createdAt;
    private Long parentCommentId;
    private List<CommentDTO> replies;
    private int likeCount;
    private int replyCount;
    private boolean isLikedByCurrentUser;
    private String timeAgo;

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
    public Long getParentCommentId() { return parentCommentId; }
    public void setParentCommentId(Long parentCommentId) { this.parentCommentId = parentCommentId; }
    public List<CommentDTO> getReplies() { return replies; }
    public void setReplies(List<CommentDTO> replies) { this.replies = replies; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public int getReplyCount() { return replyCount; }
    public void setReplyCount(int replyCount) { this.replyCount = replyCount; }
    public boolean isLikedByCurrentUser() { return isLikedByCurrentUser; }
    public void setLikedByCurrentUser(boolean isLikedByCurrentUser) { this.isLikedByCurrentUser = isLikedByCurrentUser; }
    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }

    public static CommentDTO fromEntity(com.postgresql.MasChat.model.Comment comment) {
        return fromEntity(comment, null);
    }

    public static CommentDTO fromEntity(com.postgresql.MasChat.model.Comment comment, Long currentUserId) {
        if (comment == null) return null;
        try {
            CommentDTO dto = new CommentDTO();
            dto.setId(comment.getId());
            dto.setUserId(comment.getUser() != null ? comment.getUser().getId() : null);
            dto.setUsername(comment.getUser() != null ? comment.getUser().getUsername() : null);
            dto.setProfilePicture(comment.getUser() != null ? comment.getUser().getProfilePicture() : null);
            dto.setContent(comment.getContent());
            dto.setCreatedAt(comment.getCreatedAt());
            dto.setParentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null);
            dto.setLikeCount(comment.getLikeCount());
            dto.setReplyCount(comment.getReplyCount());
            dto.setLikedByCurrentUser(currentUserId != null && comment.isLikedByUser(currentUserId));
            dto.setTimeAgo(formatTimeAgo(comment.getCreatedAt()));
            
            // Convert replies to DTOs
            if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                dto.setReplies(comment.getReplies().stream()
                    .map(reply -> fromEntity(reply, currentUserId))
                    .filter(reply -> reply != null) // Filter out null replies
                    .collect(Collectors.toList()));
            }
            
            return dto;
        } catch (Exception e) {
            System.err.println("Error converting comment to DTO: " + e.getMessage());
            e.printStackTrace();
            // Return a minimal DTO with error information
            CommentDTO errorDto = new CommentDTO();
            errorDto.setId(comment.getId());
            errorDto.setContent("Error loading comment");
            errorDto.setUsername("Unknown");
            errorDto.setLikeCount(0);
            errorDto.setReplyCount(0);
            errorDto.setLikedByCurrentUser(false);
            errorDto.setTimeAgo("");
            return errorDto;
        }
    }

    private static String formatTimeAgo(LocalDateTime createdAt) {
        if (createdAt == null) return "";
        
        LocalDateTime now = LocalDateTime.now();
        long seconds = java.time.Duration.between(createdAt, now).getSeconds();
        
        if (seconds < 60) return seconds + "s";
        if (seconds < 3600) return (seconds / 60) + "m";
        if (seconds < 86400) return (seconds / 3600) + "h";
        if (seconds < 2592000) return (seconds / 86400) + "d";
        if (seconds < 31536000) return (seconds / 2592000) + "mo";
        return (seconds / 31536000) + "y";
    }
} 