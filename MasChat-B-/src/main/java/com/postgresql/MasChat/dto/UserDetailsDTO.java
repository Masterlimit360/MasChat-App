package com.postgresql.MasChat.dto;

public class UserDetailsDTO {
    private String profileType;
    private String worksAt1;
    private String worksAt2;
    private String studiedAt;
    private String wentTo;
    private String currentCity;
    private String hometown;
    private String relationshipStatus;
    private Boolean showAvatar;
    private String avatar;
    private Integer followerCount;
    private Integer followingCount;

    // Getters
    public String getProfileType() { return profileType; }
    public String getWorksAt1() { return worksAt1; }
    public String getWorksAt2() { return worksAt2; }
    public String getStudiedAt() { return studiedAt; }
    public String getWentTo() { return wentTo; }
    public String getCurrentCity() { return currentCity; }
    public String getHometown() { return hometown; }
    public String getRelationshipStatus() { return relationshipStatus; }
    public Boolean getShowAvatar() { return showAvatar; }
    public String getAvatar() { return avatar; }
    public Integer getFollowerCount() { return followerCount; }
    public Integer getFollowingCount() { return followingCount; }

    // Setters
    public void setProfileType(String profileType) { this.profileType = profileType; }
    public void setWorksAt1(String worksAt1) { this.worksAt1 = worksAt1; }
    public void setWorksAt2(String worksAt2) { this.worksAt2 = worksAt2; }
    public void setStudiedAt(String studiedAt) { this.studiedAt = studiedAt; }
    public void setWentTo(String wentTo) { this.wentTo = wentTo; }
    public void setCurrentCity(String currentCity) { this.currentCity = currentCity; }
    public void setHometown(String hometown) { this.hometown = hometown; }
    public void setRelationshipStatus(String relationshipStatus) { this.relationshipStatus = relationshipStatus; }
    public void setShowAvatar(Boolean showAvatar) { this.showAvatar = showAvatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
    public void setFollowerCount(Integer followerCount) { this.followerCount = followerCount; }
    public void setFollowingCount(Integer followingCount) { this.followingCount = followingCount; }
}