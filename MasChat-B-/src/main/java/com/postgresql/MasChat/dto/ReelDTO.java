package com.postgresql.MasChat.dto;

import com.postgresql.MasChat.model.Reel;
import java.util.List;
import java.util.stream.Collectors;

public class ReelDTO {
    private String id;
    private String userId;
    private String username;
    private String profilePicture;
    private String mediaUrl;
    private String caption;
    private String createdAt;
    private String videoUrl;
    private List<String> likedBy;
    private int likeCount;
    private int commentCount;
    private int shareCount;

    public static ReelDTO fromEntity(Reel reel) {
        ReelDTO dto = new ReelDTO();
        dto.setId(String.valueOf(reel.getId()));
        dto.setUserId(reel.getUser().getId().toString());
        dto.setUsername(reel.getUser().getUsername());
        dto.setProfilePicture(reel.getUser().getProfilePicture());
        
        // Set media URL - this is the main field for media content
        String mediaUrl = reel.getMediaUrl();
        dto.setMediaUrl(mediaUrl);
        
        // For backward compatibility, also set videoUrl to the same value
        // This allows frontend to use either field
        dto.setVideoUrl(mediaUrl);
        
        dto.setCaption(reel.getCaption());
        dto.setCreatedAt(reel.getCreatedAt().toString());
        
        System.out.println("ReelDTO created - ID: " + dto.getId() + ", Media URL: " + mediaUrl);
        
        // Convert likedBy Set<User> to List<String>
        if (reel.getLikedBy() != null) {
            dto.setLikedBy(reel.getLikedBy().stream()
                .map(user -> user.getId().toString())
                .collect(Collectors.toList()));
            dto.setLikeCount(reel.getLikedBy().size());
        } else {
            dto.setLikedBy(List.of());
            dto.setLikeCount(0);
        }
        
        // Set comment count
        if (reel.getComments() != null) {
            dto.setCommentCount(reel.getComments().size());
        } else {
            dto.setCommentCount(0);
        }
        
        // Set share count
        dto.setShareCount(reel.getShareCount());
        
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public List<String> getLikedBy() { return likedBy; }
    public void setLikedBy(List<String> likedBy) { this.likedBy = likedBy; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }
} 