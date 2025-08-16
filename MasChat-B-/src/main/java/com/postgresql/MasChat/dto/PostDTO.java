package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class PostDTO {
    private String id;
    private String content;
    private String imageUrl;
    private String videoUrl;
    private LocalDateTime createdAt;
    private UserDTO user;
    private List<String> likedBy;
    private int likeCount;
    private int commentCount;
    private int shareCount;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public UserDTO getUser() { return user; }
    public void setUser(UserDTO user) { this.user = user; }
    public List<String> getLikedBy() { return likedBy; }
    public void setLikedBy(List<String> likedBy) { this.likedBy = likedBy; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }

    public static PostDTO fromEntity(com.postgresql.MasChat.model.Post post) {
        if (post == null) return null;
        PostDTO dto = new PostDTO();
        dto.setId(post.getId().toString());
        dto.setContent(post.getContent());
        dto.setImageUrl(post.getImageUrl());
        dto.setVideoUrl(post.getVideoUrl());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUser(UserDTO.fromEntity(post.getUser()));
        
        // Convert likedBy Set<User> to List<String>
        if (post.getLikedBy() != null) {
            dto.setLikedBy(post.getLikedBy().stream()
                .map(user -> user.getId().toString())
                .collect(Collectors.toList()));
            dto.setLikeCount(post.getLikedBy().size());
        } else {
            dto.setLikedBy(List.of());
            dto.setLikeCount(0);
        }
        
        // Set comment count
        if (post.getComments() != null) {
            dto.setCommentCount(post.getComments().size());
        } else {
            dto.setCommentCount(0);
        }
        
        // Set share count (default to 0 for now)
        dto.setShareCount(0);
        
        return dto;
    }
} 