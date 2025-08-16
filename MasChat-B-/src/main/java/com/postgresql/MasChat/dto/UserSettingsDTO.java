package com.postgresql.MasChat.dto;

import java.time.LocalDateTime;

public class UserSettingsDTO {
    private Long id;
    private Long userId;
    
    // Privacy Settings
    private Boolean profileVisibility;
    private Boolean showOnlineStatus;
    private Boolean allowFriendRequests;
    private Boolean allowMessagesFromNonFriends;
    
    // Notification Settings
    private Boolean pushNotifications;
    private Boolean emailNotifications;
    private Boolean friendRequestNotifications;
    private Boolean messageNotifications;
    private Boolean postNotifications;
    private Boolean marketplaceNotifications;
    
    // Content Preferences
    private Boolean autoPlayVideos;
    private Boolean showSensitiveContent;
    private String language;
    private String region;
    
    // Security Settings
    private Boolean twoFactorAuth;
    private Boolean loginAlerts;
    private Boolean sessionTimeout;
    
    // Accessibility
    private Boolean highContrastMode;
    private Boolean largeText;
    private Boolean screenReader;
    
    // Data Usage
    private Boolean dataSaver;
    private Boolean autoDownloadMedia;
    
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserSettingsDTO() {}
    
    public UserSettingsDTO(Long userId) {
        this.userId = userId;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
} 