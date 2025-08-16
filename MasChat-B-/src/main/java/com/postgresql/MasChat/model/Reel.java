package com.postgresql.MasChat.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "reels")
public class Reel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "video_url")
    private String mediaUrl;
    private String caption;
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToMany
    @JoinTable(
        name = "reel_likes",
        joinColumns = @JoinColumn(name = "reel_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> likedBy = new HashSet<>();

    @OneToMany(mappedBy = "reel", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ReelComment> comments;

    private int shareCount = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getCaption() { return caption; }
    public void setCaption(String caption) { this.caption = caption; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<User> getLikedBy() { return likedBy; }
    public void setLikedBy(Set<User> likedBy) { this.likedBy = likedBy; }

    public List<ReelComment> getComments() { return comments; }
    public void setComments(List<ReelComment> comments) { this.comments = comments; }

    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }
} 