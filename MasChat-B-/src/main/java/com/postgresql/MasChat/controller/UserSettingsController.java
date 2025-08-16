package com.postgresql.MasChat.controller;

import com.postgresql.MasChat.dto.UserSettingsDTO;
import com.postgresql.MasChat.service.UserSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class UserSettingsController {
    
    @Autowired
    private UserSettingsService userSettingsService;
    
    @GetMapping("/{userId}")
    public ResponseEntity<UserSettingsDTO> getUserSettings(@PathVariable Long userId) {
        try {
            UserSettingsDTO settings = userSettingsService.getUserSettings(userId);
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<UserSettingsDTO> updateUserSettings(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updateUserSettings(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/privacy")
    public ResponseEntity<UserSettingsDTO> updatePrivacySettings(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updatePrivacySettings(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/notifications")
    public ResponseEntity<UserSettingsDTO> updateNotificationSettings(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updateNotificationSettings(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/security")
    public ResponseEntity<UserSettingsDTO> updateSecuritySettings(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updateSecuritySettings(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/accessibility")
    public ResponseEntity<UserSettingsDTO> updateAccessibilitySettings(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updateAccessibilitySettings(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{userId}/content")
    public ResponseEntity<UserSettingsDTO> updateContentPreferences(
            @PathVariable Long userId,
            @RequestBody UserSettingsDTO settingsDTO) {
        try {
            UserSettingsDTO updatedSettings = userSettingsService.updateContentPreferences(userId, settingsDTO);
            return ResponseEntity.ok(updatedSettings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/languages")
    public ResponseEntity<Map<String, String>> getAvailableLanguages() {
        Map<String, String> languages = new HashMap<>();
        languages.put("en", "English");
        languages.put("es", "Español");
        languages.put("fr", "Français");
        languages.put("de", "Deutsch");
        languages.put("it", "Italiano");
        languages.put("pt", "Português");
        languages.put("ru", "Русский");
        languages.put("zh", "中文");
        languages.put("ja", "日本語");
        languages.put("ko", "한국어");
        languages.put("ar", "العربية");
        languages.put("hi", "हिन्दी");
        
        return ResponseEntity.ok(languages);
    }
    
    @GetMapping("/regions")
    public ResponseEntity<Map<String, String>> getAvailableRegions() {
        Map<String, String> regions = new HashMap<>();
        regions.put("US", "United States");
        regions.put("CA", "Canada");
        regions.put("GB", "United Kingdom");
        regions.put("AU", "Australia");
        regions.put("DE", "Germany");
        regions.put("FR", "France");
        regions.put("ES", "Spain");
        regions.put("IT", "Italy");
        regions.put("JP", "Japan");
        regions.put("KR", "South Korea");
        regions.put("CN", "China");
        regions.put("IN", "India");
        regions.put("BR", "Brazil");
        regions.put("MX", "Mexico");
        regions.put("AR", "Argentina");
        
        return ResponseEntity.ok(regions);
    }
} 