package com.postgresql.MasChat.model;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @JsonBackReference
    private Post post;

    // Parent comment for nested replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_comment_id")
    @JsonBackReference
    private Comment parentComment;

    // Child comments (replies)
    @OneToMany(mappedBy = "parentComment", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL)
    @JsonIgnore
    private Set<Comment> replies = new HashSet<>();

    // Users who liked this comment
    @OneToMany(mappedBy = "comment", fetch = FetchType.LAZY, cascade = jakarta.persistence.CascadeType.ALL)
    @JsonIgnore
    private Set<Like> likes = new HashSet<>();

    private LocalDateTime createdAt = LocalDateTime.now();

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

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public Comment getParentComment() {
        return parentComment;
    }

    public void setParentComment(Comment parentComment) {
        this.parentComment = parentComment;
    }

    public Set<Comment> getReplies() {
        return replies;
    }

    public void setReplies(Set<Comment> replies) {
        this.replies = replies;
    }

    public Set<Like> getLikes() {
        return likes;
    }

    public void setLikes(Set<Like> likes) {
        this.likes = likes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Helper methods
    public boolean isReply() {
        return parentComment != null;
    }

    public int getLikeCount() {
        return likes != null ? likes.size() : 0;
    }

    public int getReplyCount() {
        return replies != null ? replies.size() : 0;
    }

    public boolean isLikedByUser(Long userId) {
        if (likes == null) return false;
        return likes.stream().anyMatch(like -> like.getUser() != null && like.getUser().getId() != null && like.getUser().getId().equals(userId));
    }
}
