import client from '../../api/client';

export interface UserSettings {
  id?: number;
  userId: number;
  
  // Privacy Settings
  profileVisibility?: boolean;
  showOnlineStatus?: boolean;
  allowFriendRequests?: boolean;
  allowMessagesFromNonFriends?: boolean;
  
  // Notification Settings
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  friendRequestNotifications?: boolean;
  messageNotifications?: boolean;
  postNotifications?: boolean;
  marketplaceNotifications?: boolean;
  
  // Content Preferences
  autoPlayVideos?: boolean;
  showSensitiveContent?: boolean;
  language?: string;
  region?: string;
  
  // Security Settings
  twoFactorAuth?: boolean;
  loginAlerts?: boolean;
  sessionTimeout?: boolean;
  
  // Accessibility
  highContrastMode?: boolean;
  largeText?: boolean;
  screenReader?: boolean;
  
  // Data Usage
  dataSaver?: boolean;
  autoDownloadMedia?: boolean;
  
  updatedAt?: string;
}

export interface Language {
  code: string;
  name: string;
}

export interface Region {
  code: string;
  name: string;
}

class SettingsService {
  private baseUrl = '/api/settings';

  async getUserSettings(userId: number): Promise<UserSettings> {
    try {
      const response = await client.get(`${this.baseUrl}/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      throw error;
    }
  }

  async updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating user settings:', error);
      throw error;
    }
  }

  async updatePrivacySettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}/privacy`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw error;
    }
  }

  async updateNotificationSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}/notifications`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating notification settings:', error);
      throw error;
    }
  }

  async updateSecuritySettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}/security`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating security settings:', error);
      throw error;
    }
  }

  async updateAccessibilitySettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}/accessibility`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
      throw error;
    }
  }

  async updateContentPreferences(userId: number, settings: Partial<UserSettings>): Promise<UserSettings> {
    try {
      const response = await client.put(`${this.baseUrl}/${userId}/content`, settings);
      return response.data;
    } catch (error) {
      console.error('Error updating content preferences:', error);
      throw error;
    }
  }

  async getAvailableLanguages(): Promise<Record<string, string>> {
    try {
      const response = await client.get(`${this.baseUrl}/languages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  async getAvailableRegions(): Promise<Record<string, string>> {
    try {
      const response = await client.get(`${this.baseUrl}/regions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();

// Default export to fix warning
export default settingsService; 