import { Entypo, FontAwesome5, Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Pressable,
  Alert,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getBestFriends, Friend, getUserFriends } from '../lib/services/userService';
import ModernHeader from '../../components/ModernHeader';

// Color Palette
const COLORS = {
  light: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    lightText: '#6C757D',
    border: '#E9ECEF',
    success: '#4CC9F0',
    dark: '#1A1A2E',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',
    dark: '#1A1A2E',
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

const shortcuts = [
  { name: "Preety Shy", avatar: "https://randomuser.me/api/portraits/men/31.jpg" },
  { name: "Sarfo Kelvin", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
];

export default function Menu() {
  const router = useRouter();
  const { user } = useAuth();
  const { themeMode, currentTheme, setThemeMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [bestFriends, setBestFriends] = useState<Friend[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];

  useEffect(() => {
    if (user) {
      setLoading(false);
      getBestFriends(user.id)
        .then(setBestFriends)
        .catch(() => setBestFriends([]));
      getUserFriends(user.id)
        .then(friends => setFriendCount(friends.length))
        .catch(() => setFriendCount(0));
    }
  }, [user]);

  const getThemeIcon = () => {
    switch (themeMode) {
      case 'light':
        return <Ionicons name="sunny" size={24} color="#FFD700" />;
      case 'dark':
        return <Ionicons name="moon" size={24} color="#8B5CF6" />;
      case 'system':
        return <Ionicons name="settings" size={24} color="#10B981" />;
      default:
        return <Ionicons name="settings" size={24} color="#10B981" />;
    }
  };

  const getThemeLabel = () => {
    switch (themeMode) {
      case 'light':
        return 'Light Mode';
      case 'dark':
        return 'Dark Mode';
      case 'system':
        return 'System Theme';
      default:
        return 'Theme';
    }
  };

  const handleThemeToggle = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme mode:',
      [
        {
          text: 'Light Mode',
          onPress: () => setThemeMode('light'),
          style: themeMode === 'light' ? 'default' : 'default'
        },
        {
          text: 'Dark Mode',
          onPress: () => setThemeMode('dark'),
          style: themeMode === 'dark' ? 'default' : 'default'
        },
        {
          text: 'System Preference',
          onPress: () => setThemeMode('system'),
          style: themeMode === 'system' ? 'default' : 'default'
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  const menuOptions = [
    { label: "Friends", icon: <MaterialIcons name="people" size={24} color={colors.primary} /> },
    { label: "Mass Coin", icon: <MaterialIcons name="monetization-on" size={24} color="#FFD700" /> },
    { label: "Dashboard", icon: <MaterialCommunityIcons name="view-dashboard" size={24} color={colors.primary} /> },
    { label: "Memories", icon: <MaterialIcons name="history" size={24} color={colors.primary} /> },
    { label: "Feeds", icon: <MaterialCommunityIcons name="rss" size={24} color={colors.primary} /> },
    { label: "Groups", icon: <FontAwesome5 name="users" size={24} color={colors.primary} /> },
    { label: "Marketplace", icon: <FontAwesome5 name="store" size={24} color={colors.primary} /> },
    { label: "Reels", icon: <Entypo name="video" size={24} color={colors.primary} /> },
    { label: "Saved", icon: <MaterialIcons name="bookmark" size={24} color="#A259E6" /> },
    { label: "Support", icon: <Ionicons name="heart-outline" size={26} color="#2196F3" /> },
    { label: "Ad Center", icon: <MaterialCommunityIcons name="bullhorn-outline" size={26} color="#2196F3" /> },
    { label: getThemeLabel(), icon: getThemeIcon(), onPress: handleThemeToggle },
  ];

  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Deduplicate bestFriends before slicing for shortcuts
  const uniqueBestFriends = Array.from(new Map(bestFriends.map(f => [f.id, f])).values());

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <ModernHeader
        title="Menu"
        showMassCoinBalance={true}
        onSearch={() => router.push('/screens/SearchScreen')}
        onSettings={() => router.push('/screens/SettingsScreen')}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Profile Card */}
        <TouchableOpacity style={[styles.profileCard, { backgroundColor: colors.card }]} onPress={() => router.push("/profile")}>
          <Image 
            source={{ uri: user?.profilePicture || "https://i.imgur.com/6XbK6bE.jpg" }} 
            style={styles.profileAvatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.fullName || user?.username || 'User'}</Text>
            <Text style={[styles.profileSubtext, { color: colors.lightText }]}>View your profile</Text>
          </View>
          <View style={styles.followerBadge}>
            <Text style={styles.followerText}>{friendCount} Friends</Text>
          </View>
        </TouchableOpacity>

        {/* Shortcuts */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Shortcuts</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.shortcutsContainer}>
          {uniqueBestFriends.slice(0, 5).map((friend) => (
            <TouchableOpacity key={friend.id} style={styles.shortcutItem} onPress={() => router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: friend.id } })}>
              <Image source={{ uri: friend.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }} style={styles.shortcutAvatar} />
              <Text style={[styles.shortcutName, { color: colors.text }]}>{friend.fullName || friend.username}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuOptions.map((item, idx) => (
            <TouchableOpacity
              key={item.label + '-' + idx}
              style={[styles.menuItem, { backgroundColor: colors.card }]}
              onPress={() => {
                if (item.onPress) {
                  item.onPress();
                } else if (item.label === 'Friends') router.push('/friends/FriendsScreen');
                else if (item.label === 'Mass Coin') router.push('/screens/MassCoinDashboardScreen');
                else if (item.label === 'Marketplace') router.push('/(tabs)/marketplace');
                else if (item.label === 'Reels') router.push('/(create)/newReel');
                else if (item.label === 'Dashboard') router.push('/screens/DashboardScreen');
                else if (item.label === 'Memories') router.push('/screens/MemoriesScreen');
                else if (item.label === 'Feeds') router.push('/screens/FeedsScreen');
                else if (item.label === 'Groups') router.push('/screens/GroupsScreen');
                else if (item.label === 'Saved') router.push('/screens/SavedScreen');
                else if (item.label === 'Support') router.push('/screens/SupportScreen');
                else if (item.label === 'Ad Center') router.push('/screens/AdCenterScreen');
              }}
            >
              <View style={styles.menuIcon}>
                {item.icon}
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => {
            Alert.alert(
              'Logout',
              'Are you sure you want to logout?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: () => router.replace("/login") }
              ]
            );
          }}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
    paddingTop: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.light.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.light.accent,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  profileSubtext: {
    fontSize: 14,
    color: COLORS.light.lightText,
    marginTop: 4,
  },
  followerBadge: {
    backgroundColor: COLORS.light.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  followerText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginLeft: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  shortcutsContainer: {
    paddingLeft: 16,
    marginBottom: 16,
  },
  shortcutItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  shortcutAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.light.accent,
    marginBottom: 8,
  },
  shortcutName: {
    fontSize: 14,
    color: COLORS.light.text,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    width: '48%',
    backgroundColor: COLORS.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.light.text,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.light.accent,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});