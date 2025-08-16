package com.postgresql.MasChat.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "user_details")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(mappedBy = "details")
    @JsonBackReference
    private User user;

    @Column(name = "profile_type")
    private String profileType = "";

    @Column(name = "works_at1")
    private String worksAt1;

    @Column(name = "works_at2")
    private String worksAt2;

    @Column(name = "studied_at")
    private String studiedAt;

    @Column(name = "went_to")
    private String wentTo;

    @Column(name = "current_city")
    private String currentCity;

    @Column(name = "hometown")
    private String hometown;

    @Column(name = "relationship_status")
    private String relationshipStatus;

    @Column(name = "show_avatar")
    private Boolean showAvatar = false;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "follower_count")
    private Integer followerCount = 0;

    @Column(name = "following_count")
    private Integer followingCount = 0;

    public UserProfile() {}

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getProfileType() {
        return profileType;
    }

    public void setProfileType(String profileType) {
        this.profileType = profileType;
    }

    public String getWorksAt1() {
        return worksAt1;
    }

    public void setWorksAt1(String worksAt1) {
        this.worksAt1 = worksAt1;
    }

    public String getWorksAt2() {
        return worksAt2;
    }

    public void setWorksAt2(String worksAt2) {
        this.worksAt2 = worksAt2;
    }

    public String getStudiedAt() {
        return studiedAt;
    }

    public void setStudiedAt(String studiedAt) {
        this.studiedAt = studiedAt;
    }

    public String getWentTo() {
        return wentTo;
    }

    public void setWentTo(String wentTo) {
        this.wentTo = wentTo;
    }

    public String getCurrentCity() {
        return currentCity;
    }

    public void setCurrentCity(String currentCity) {
        this.currentCity = currentCity;
    }

    public String getHometown() {
        return hometown;
    }

    public void setHometown(String hometown) {
        this.hometown = hometown;
    }

    public String getRelationshipStatus() {
        return relationshipStatus;
    }

    public void setRelationshipStatus(String relationshipStatus) {
        this.relationshipStatus = relationshipStatus;
    }

    public Boolean getShowAvatar() {
        return showAvatar;
    }

    public void setShowAvatar(Boolean showAvatar) {
        this.showAvatar = showAvatar;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public Integer getFollowerCount() {
        return followerCount;
    }

    public void setFollowerCount(Integer followerCount) {
        this.followerCount = followerCount;
    }

    public Integer getFollowingCount() {
        return followingCount;
    }

    public void setFollowingCount(Integer followingCount) {
        this.followingCount = followingCount;
    }
}
