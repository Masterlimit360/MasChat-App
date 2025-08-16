package com.postgresql.MasChat.dto;

import com.postgresql.MasChat.model.Story;
import com.postgresql.MasChat.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class StoryDTO {
    private Long id;
    private Long userId;
    private String username;
    private String profilePicture;
    private String mediaUrl;
    private String caption;
    private String createdAt;
    private List<Long> likedBy;

    public static StoryDTO fromEntity(Story story) {
        StoryDTO dto = new StoryDTO();
        dto.setId(story.getId());
        dto.setUserId(story.getUser().getId());
        dto.setUsername(story.getUser().getUsername());
        dto.setProfilePicture(story.getUser().getProfilePicture());
        dto.setMediaUrl(story.getMediaUrl());
        dto.setCaption(story.getCaption());
        dto.setCreatedAt(story.getCreatedAt().toString());
        dto.setLikedBy(story.getLikedBy().stream().map(User::getId).collect(Collectors.toList()));
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
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
    public List<Long> getLikedBy() { return likedBy; }
    public void setLikedBy(List<Long> likedBy) { this.likedBy = likedBy; }
} 