package com.postgresql.MasChat.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_settings")
public class UserSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    
    // Privacy Settings
    private Boolean profileVisibility = true;
    private Boolean showOnlineStatus = true;
    private Boolean allowFriendRequests = true;
    private Boolean allowMessagesFromNonFriends = false;
    
    // Notification Settings
    private Boolean pushNotifications = true;
    private Boolean emailNotifications = true;
    private Boolean friendRequestNotifications = true;
    private Boolean messageNotifications = true;
    private Boolean postNotifications = true;
    private Boolean marketplaceNotifications = true;
    
    // Content Preferences
    private Boolean autoPlayVideos = true;
    private Boolean showSensitiveContent = false;
    private String language = "en";
    private String region = "US";
    
    // Security Settings
    private Boolean twoFactorAuth = false;
    private Boolean loginAlerts = true;
    private Boolean sessionTimeout = true;
    
    // Accessibility
    private Boolean highContrastMode = false;
    private Boolean largeText = false;
    private Boolean screenReader = false;
    
    // Data Usage
    private Boolean dataSaver = false;
    private Boolean autoDownloadMedia = false;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
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
    
    public Boolean getProfileVisibility() {
        return profileVisibility;
    }
    
    public void setProfileVisibility(Boolean profileVisibility) {
        this.profileVisibility = profileVisibility;
    }
    
    public Boolean getShowOnlineStatus() {
        return showOnlineStatus;
    }
    
    public void setShowOnlineStatus(Boolean showOnlineStatus) {
        this.showOnlineStatus = showOnlineStatus;
    }
    
    public Boolean getAllowFriendRequests() {
        return allowFriendRequests;
    }
    
    public void setAllowFriendRequests(Boolean allowFriendRequests) {
        this.allowFriendRequests = allowFriendRequests;
    }
    
    public Boolean getAllowMessagesFromNonFriends() {
        return allowMessagesFromNonFriends;
    }
    
    public void setAllowMessagesFromNonFriends(Boolean allowMessagesFromNonFriends) {
        this.allowMessagesFromNonFriends = allowMessagesFromNonFriends;
    }
    
    public Boolean getPushNotifications() {
        return pushNotifications;
    }
    
    public void setPushNotifications(Boolean pushNotifications) {
        this.pushNotifications = pushNotifications;
    }
    
    public Boolean getEmailNotifications() {
        return emailNotifications;
    }
    
    public void setEmailNotifications(Boolean emailNotifications) {
        this.emailNotifications = emailNotifications;
    }
    
    public Boolean getFriendRequestNotifications() {
        return friendRequestNotifications;
    }
    
    public void setFriendRequestNotifications(Boolean friendRequestNotifications) {
        this.friendRequestNotifications = friendRequestNotifications;
    }
    
    public Boolean getMessageNotifications() {
        return messageNotifications;
    }
    
    public void setMessageNotifications(Boolean messageNotifications) {
        this.messageNotifications = messageNotifications;
    }
    
    public Boolean getPostNotifications() {
        return postNotifications;
    }
    
    public void setPostNotifications(Boolean postNotifications) {
        this.postNotifications = postNotifications;
    }
    
    public Boolean getMarketplaceNotifications() {
        return marketplaceNotifications;
    }
    
    public void setMarketplaceNotifications(Boolean marketplaceNotifications) {
        this.marketplaceNotifications = marketplaceNotifications;
    }
    
    public Boolean getAutoPlayVideos() {
        return autoPlayVideos;
    }
    
    public void setAutoPlayVideos(Boolean autoPlayVideos) {
        this.autoPlayVideos = autoPlayVideos;
    }
    
    public Boolean getShowSensitiveContent() {
        return showSensitiveContent;
    }
    
    public void setShowSensitiveContent(Boolean showSensitiveContent) {
        this.showSensitiveContent = showSensitiveContent;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getRegion() {
        return region;
    }
    
    public void setRegion(String region) {
        this.region = region;
    }
    
    public Boolean getTwoFactorAuth() {
        return twoFactorAuth;
    }
    
    public void setTwoFactorAuth(Boolean twoFactorAuth) {
        this.twoFactorAuth = twoFactorAuth;
    }
    
    public Boolean getLoginAlerts() {
        return loginAlerts;
    }
    
    public void setLoginAlerts(Boolean loginAlerts) {
        this.loginAlerts = loginAlerts;
    }
    
    public Boolean getSessionTimeout() {
        return sessionTimeout;
    }
    
    public void setSessionTimeout(Boolean sessionTimeout) {
        this.sessionTimeout = sessionTimeout;
    }
    
    public Boolean getHighContrastMode() {
        return highContrastMode;
    }
    
    public void setHighContrastMode(Boolean highContrastMode) {
        this.highContrastMode = highContrastMode;
    }
    
    public Boolean getLargeText() {
        return largeText;
    }
    
    public void setLargeText(Boolean largeText) {
        this.largeText = largeText;
    }
    
    public Boolean getScreenReader() {
        return screenReader;
    }
    
    public void setScreenReader(Boolean screenReader) {
        this.screenReader = screenReader;
    }
    
    public Boolean getDataSaver() {
        return dataSaver;
    }
    
    public void setDataSaver(Boolean dataSaver) {
        this.dataSaver = dataSaver;
    }
    
    public Boolean getAutoDownloadMedia() {
        return autoDownloadMedia;
    }
    
    public void setAutoDownloadMedia(Boolean autoDownloadMedia) {
        this.autoDownloadMedia = autoDownloadMedia;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 