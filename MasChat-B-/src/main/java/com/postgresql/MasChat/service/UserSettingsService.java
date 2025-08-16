package com.postgresql.MasChat.service;

import com.postgresql.MasChat.dto.UserSettingsDTO;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.model.UserSettings;
import com.postgresql.MasChat.repository.UserRepository;
import com.postgresql.MasChat.repository.UserSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class UserSettingsService {
    
    @Autowired
    private UserSettingsRepository userSettingsRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public UserSettingsDTO getUserSettings(Long userId) {
        Optional<UserSettings> settings = userSettingsRepository.findByUserId(userId);
        if (settings.isPresent()) {
            return convertToDTO(settings.get());
        }
        // Return default settings if none exist
        return createDefaultSettings(userId);
    }
    
    public UserSettingsDTO updateUserSettings(Long userId, UserSettingsDTO settingsDTO) {
        Optional<UserSettings> existingSettings = userSettingsRepository.findByUserId(userId);
        UserSettings settings;
        
        if (existingSettings.isPresent()) {
            settings = existingSettings.get();
        } else {
            settings = new UserSettings();
            Optional<User> user = userRepository.findById(userId);
            if (user.isPresent()) {
                settings.setUser(user.get());
            } else {
                throw new RuntimeException("User not found");
            }
        }
        
        // Update settings with DTO values
        updateSettingsFromDTO(settings, settingsDTO);
        settings.setUpdatedAt(LocalDateTime.now());
        
        UserSettings savedSettings = userSettingsRepository.save(settings);
        return convertToDTO(savedSettings);
    }
    
    public UserSettingsDTO updatePrivacySettings(Long userId, UserSettingsDTO settingsDTO) {
        UserSettingsDTO currentSettings = getUserSettings(userId);
        
        if (settingsDTO.getProfileVisibility() != null) {
            currentSettings.setProfileVisibility(settingsDTO.getProfileVisibility());
        }
        if (settingsDTO.getShowOnlineStatus() != null) {
            currentSettings.setShowOnlineStatus(settingsDTO.getShowOnlineStatus());
        }
        if (settingsDTO.getAllowFriendRequests() != null) {
            currentSettings.setAllowFriendRequests(settingsDTO.getAllowFriendRequests());
        }
        if (settingsDTO.getAllowMessagesFromNonFriends() != null) {
            currentSettings.setAllowMessagesFromNonFriends(settingsDTO.getAllowMessagesFromNonFriends());
        }
        
        return updateUserSettings(userId, currentSettings);
    }
    
    public UserSettingsDTO updateNotificationSettings(Long userId, UserSettingsDTO settingsDTO) {
        UserSettingsDTO currentSettings = getUserSettings(userId);
        
        if (settingsDTO.getPushNotifications() != null) {
            currentSettings.setPushNotifications(settingsDTO.getPushNotifications());
        }
        if (settingsDTO.getEmailNotifications() != null) {
            currentSettings.setEmailNotifications(settingsDTO.getEmailNotifications());
        }
        if (settingsDTO.getFriendRequestNotifications() != null) {
            currentSettings.setFriendRequestNotifications(settingsDTO.getFriendRequestNotifications());
        }
        if (settingsDTO.getMessageNotifications() != null) {
            currentSettings.setMessageNotifications(settingsDTO.getMessageNotifications());
        }
        if (settingsDTO.getPostNotifications() != null) {
            currentSettings.setPostNotifications(settingsDTO.getPostNotifications());
        }
        if (settingsDTO.getMarketplaceNotifications() != null) {
            currentSettings.setMarketplaceNotifications(settingsDTO.getMarketplaceNotifications());
        }
        
        return updateUserSettings(userId, currentSettings);
    }
    
    public UserSettingsDTO updateSecuritySettings(Long userId, UserSettingsDTO settingsDTO) {
        UserSettingsDTO currentSettings = getUserSettings(userId);
        
        if (settingsDTO.getTwoFactorAuth() != null) {
            currentSettings.setTwoFactorAuth(settingsDTO.getTwoFactorAuth());
        }
        if (settingsDTO.getLoginAlerts() != null) {
            currentSettings.setLoginAlerts(settingsDTO.getLoginAlerts());
        }
        if (settingsDTO.getSessionTimeout() != null) {
            currentSettings.setSessionTimeout(settingsDTO.getSessionTimeout());
        }
        
        return updateUserSettings(userId, currentSettings);
    }
    
    public UserSettingsDTO updateAccessibilitySettings(Long userId, UserSettingsDTO settingsDTO) {
        UserSettingsDTO currentSettings = getUserSettings(userId);
        
        if (settingsDTO.getHighContrastMode() != null) {
            currentSettings.setHighContrastMode(settingsDTO.getHighContrastMode());
        }
        if (settingsDTO.getLargeText() != null) {
            currentSettings.setLargeText(settingsDTO.getLargeText());
        }
        if (settingsDTO.getScreenReader() != null) {
            currentSettings.setScreenReader(settingsDTO.getScreenReader());
        }
        
        return updateUserSettings(userId, currentSettings);
    }
    
    public UserSettingsDTO updateContentPreferences(Long userId, UserSettingsDTO settingsDTO) {
        UserSettingsDTO currentSettings = getUserSettings(userId);
        
        if (settingsDTO.getAutoPlayVideos() != null) {
            currentSettings.setAutoPlayVideos(settingsDTO.getAutoPlayVideos());
        }
        if (settingsDTO.getShowSensitiveContent() != null) {
            currentSettings.setShowSensitiveContent(settingsDTO.getShowSensitiveContent());
        }
        if (settingsDTO.getLanguage() != null) {
            currentSettings.setLanguage(settingsDTO.getLanguage());
        }
        if (settingsDTO.getRegion() != null) {
            currentSettings.setRegion(settingsDTO.getRegion());
        }
        if (settingsDTO.getDataSaver() != null) {
            currentSettings.setDataSaver(settingsDTO.getDataSaver());
        }
        if (settingsDTO.getAutoDownloadMedia() != null) {
            currentSettings.setAutoDownloadMedia(settingsDTO.getAutoDownloadMedia());
        }
        
        return updateUserSettings(userId, currentSettings);
    }
    
    private UserSettingsDTO createDefaultSettings(Long userId) {
        UserSettingsDTO defaultSettings = new UserSettingsDTO(userId);
        defaultSettings.setProfileVisibility(true);
        defaultSettings.setShowOnlineStatus(true);
        defaultSettings.setAllowFriendRequests(true);
        defaultSettings.setAllowMessagesFromNonFriends(false);
        defaultSettings.setPushNotifications(true);
        defaultSettings.setEmailNotifications(true);
        defaultSettings.setFriendRequestNotifications(true);
        defaultSettings.setMessageNotifications(true);
        defaultSettings.setPostNotifications(true);
        defaultSettings.setMarketplaceNotifications(true);
        defaultSettings.setAutoPlayVideos(true);
        defaultSettings.setShowSensitiveContent(false);
        defaultSettings.setLanguage("en");
        defaultSettings.setRegion("US");
        defaultSettings.setTwoFactorAuth(false);
        defaultSettings.setLoginAlerts(true);
        defaultSettings.setSessionTimeout(true);
        defaultSettings.setHighContrastMode(false);
        defaultSettings.setLargeText(false);
        defaultSettings.setScreenReader(false);
        defaultSettings.setDataSaver(false);
        defaultSettings.setAutoDownloadMedia(false);
        
        return updateUserSettings(userId, defaultSettings);
    }
    
    private void updateSettingsFromDTO(UserSettings settings, UserSettingsDTO dto) {
        if (dto.getProfileVisibility() != null) settings.setProfileVisibility(dto.getProfileVisibility());
        if (dto.getShowOnlineStatus() != null) settings.setShowOnlineStatus(dto.getShowOnlineStatus());
        if (dto.getAllowFriendRequests() != null) settings.setAllowFriendRequests(dto.getAllowFriendRequests());
        if (dto.getAllowMessagesFromNonFriends() != null) settings.setAllowMessagesFromNonFriends(dto.getAllowMessagesFromNonFriends());
        if (dto.getPushNotifications() != null) settings.setPushNotifications(dto.getPushNotifications());
        if (dto.getEmailNotifications() != null) settings.setEmailNotifications(dto.getEmailNotifications());
        if (dto.getFriendRequestNotifications() != null) settings.setFriendRequestNotifications(dto.getFriendRequestNotifications());
        if (dto.getMessageNotifications() != null) settings.setMessageNotifications(dto.getMessageNotifications());
        if (dto.getPostNotifications() != null) settings.setPostNotifications(dto.getPostNotifications());
        if (dto.getMarketplaceNotifications() != null) settings.setMarketplaceNotifications(dto.getMarketplaceNotifications());
        if (dto.getAutoPlayVideos() != null) settings.setAutoPlayVideos(dto.getAutoPlayVideos());
        if (dto.getShowSensitiveContent() != null) settings.setShowSensitiveContent(dto.getShowSensitiveContent());
        if (dto.getLanguage() != null) settings.setLanguage(dto.getLanguage());
        if (dto.getRegion() != null) settings.setRegion(dto.getRegion());
        if (dto.getTwoFactorAuth() != null) settings.setTwoFactorAuth(dto.getTwoFactorAuth());
        if (dto.getLoginAlerts() != null) settings.setLoginAlerts(dto.getLoginAlerts());
        if (dto.getSessionTimeout() != null) settings.setSessionTimeout(dto.getSessionTimeout());
        if (dto.getHighContrastMode() != null) settings.setHighContrastMode(dto.getHighContrastMode());
        if (dto.getLargeText() != null) settings.setLargeText(dto.getLargeText());
        if (dto.getScreenReader() != null) settings.setScreenReader(dto.getScreenReader());
        if (dto.getDataSaver() != null) settings.setDataSaver(dto.getDataSaver());
        if (dto.getAutoDownloadMedia() != null) settings.setAutoDownloadMedia(dto.getAutoDownloadMedia());
    }
    
    private UserSettingsDTO convertToDTO(UserSettings settings) {
        UserSettingsDTO dto = new UserSettingsDTO();
        dto.setId(settings.getId());
        dto.setUserId(settings.getUser().getId());
        dto.setProfileVisibility(settings.getProfileVisibility());
        dto.setShowOnlineStatus(settings.getShowOnlineStatus());
        dto.setAllowFriendRequests(settings.getAllowFriendRequests());
        dto.setAllowMessagesFromNonFriends(settings.getAllowMessagesFromNonFriends());
        dto.setPushNotifications(settings.getPushNotifications());
        dto.setEmailNotifications(settings.getEmailNotifications());
        dto.setFriendRequestNotifications(settings.getFriendRequestNotifications());
        dto.setMessageNotifications(settings.getMessageNotifications());
        dto.setPostNotifications(settings.getPostNotifications());
        dto.setMarketplaceNotifications(settings.getMarketplaceNotifications());
        dto.setAutoPlayVideos(settings.getAutoPlayVideos());
        dto.setShowSensitiveContent(settings.getShowSensitiveContent());
        dto.setLanguage(settings.getLanguage());
        dto.setRegion(settings.getRegion());
        dto.setTwoFactorAuth(settings.getTwoFactorAuth());
        dto.setLoginAlerts(settings.getLoginAlerts());
        dto.setSessionTimeout(settings.getSessionTimeout());
        dto.setHighContrastMode(settings.getHighContrastMode());
        dto.setLargeText(settings.getLargeText());
        dto.setScreenReader(settings.getScreenReader());
        dto.setDataSaver(settings.getDataSaver());
        dto.setAutoDownloadMedia(settings.getAutoDownloadMedia());
        dto.setUpdatedAt(settings.getUpdatedAt());
        
        return dto;
    }
} 