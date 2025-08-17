import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, ScrollView, Platform, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { messageService, RecentChat } from '../lib/services/messageService';
import { fetchStories, Story } from '../lib/services/storyService';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getWebSocketUrl } from '../api/client';
import { useTheme } from '../context/ThemeContext';

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
    danger: '#FF3040',
    warning: '#FFC107',
    white: '#FFFFFF',
    dark: '#1A1A2E',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E',
    card: '#2D2D44',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',
    success: '#4CC9F0',
    danger: '#FF3040',
    warning: '#FFC107',
    white: '#FFFFFF',
    dark: '#1A1A2E',
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

const DEFAULT_PROFILE_PHOTO = "https://randomuser.me/api/portraits/men/1.jpg";

export default function MessengerScreen() {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState<RecentChat[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStories, setLoadingStories] = useState(true);
  const [activeTab, setActiveTab] = useState('Inbox');
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];

  // Story-related state
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [currentUserStories, setCurrentUserStories] = useState<Story[]>([]);
  const [currentStoryUser, setCurrentStoryUser] = useState<any>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  const loadRecentChats = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const recentChats = await messageService.getRecentChats(user.id);
      setChats(recentChats);
    } catch (error) {
      console.error('Error loading recent chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    setLoadingStories(true);
    try {
      const data = await fetchStories();
      setStories(data);
    } catch (error) {
      console.error('Error loading stories:', error);
      setStories([]);
    } finally {
      setLoadingStories(false);
    }
  };

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.userId]) {
      acc[story.userId] = [];
    }
    acc[story.userId].push(story);
    return acc;
  }, {} as { [key: string]: Story[] });

  const getLatestStoryForUser = (userId: string) => {
    const userStories = storiesByUser[userId] || [];
    return userStories.length > 0 ? userStories[userStories.length - 1] : null;
  };

  const getStoryThumbnail = (story: Story) => {
    if (story.mediaUrl.endsWith('.mp4') || story.mediaUrl.endsWith('.mov')) {
      // For video stories, use a placeholder or first frame
      return story.profilePicture || DEFAULT_PROFILE_PHOTO;
    }
    return story.mediaUrl;
  };

  const uniqueStoryUsers = Object.values(storiesByUser).map(stories => stories[0]);

  // Check if current user has stories
  const userStories = user ? storiesByUser[user.id] || [] : [];
  const userLatestStory = userStories.length > 0 ? userStories[userStories.length - 1] : null;
  const hasUserStories = userStories.length > 0;

  const openUserStories = (userId: string, username?: string, profilePicture?: string) => {
    const userStories = storiesByUser[userId] || [];
    if (userStories.length > 0) {
      setCurrentUserStories(userStories);
      setCurrentStoryUser({ id: userId, username, profilePicture });
      setCurrentStoryIndex(0);
      setStoryViewerVisible(true);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    loadRecentChats();
    loadStories();
    
    // Connect to WebSocket
    const socket = new WebSocket(getWebSocketUrl());

    socket.onopen = () => {
      console.log('WebSocket connected');
      socket.send(JSON.stringify({
        type: 'authenticate',
        token: user.token,
      }));
      socket.send(JSON.stringify({
        type: 'subscribe',
        destination: `/user/${user.id}/queue/messages`,
      }));
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'message') {
        // On any new message, refresh recent chats
        loadRecentChats();
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket closed');
    };

    return () => {
      socket.close();
    };
  }, [user?.id]);

  // Refresh chats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadRecentChats();
      loadStories();
    }, [user?.id])
  );

  const markAsRead = async (partnerId: string) => {
    if (!user?.id) return;
    try {
      await messageService.markAsRead(user.id, partnerId);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const handleChatPress = async (chat: RecentChat) => {
    if (!chat?.id) {
      Alert.alert('Error', 'This chat is missing user information and cannot be opened.');
      return;
    }
    // Mark messages as read when opening chat
    await markAsRead(chat.id);
    // Defensive: always pass a full recipient object
    const recipient = {
      id: chat.id,
      username: chat.username,
      name: chat.fullName || chat.username,
      image: chat.profilePicture || '',
      profilePicture: chat.profilePicture || '',
      fullName: chat.fullName || '',
    };
    router.push({ 
      pathname: "/screens/ChatScreen", 
      params: { recipient: JSON.stringify(recipient) } 
    });
  };

  const filteredChats = chats
    .filter(chat => 
      chat.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      chat.username?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());

  const renderChatItem = ({ item }: { item: RecentChat }) => (
    <TouchableOpacity
      style={[styles.chatItem, { backgroundColor: colors.card }]}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.chatImageContainer}>
        <Image 
          source={{ uri: item.profilePicture || DEFAULT_PROFILE_PHOTO }} 
          style={styles.chatImage} 
        />
        {item.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.chatContent}>
        <Text style={[styles.chatName, { color: colors.text }]}>{item.fullName || item.username}</Text>
        <Text style={[styles.chatMessage, { color: colors.lightText }]} numberOfLines={1}>
          {item.lastMessage || 'No messages yet'}
        </Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={[styles.chatDate, { color: colors.lightText }]}>{formatDateTime(item.lastMessageTime)}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const tabs = ['Inbox', 'Communities', 'Requests', 'Spam'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <BlurView
        intensity={80}
        tint={currentTheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: colors.tabBarBg, borderBottomColor: colors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Messenger</Text>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/friends/SuggestionsScreen')}>
              <Ionicons name="person-add" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/home')}>
              <Ionicons name="home" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.background }]}>
          <Ionicons name="search" size={20} color={colors.lightText} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search"
            placeholderTextColor={colors.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Stories Section */}
      <View style={[styles.storiesContainer, { backgroundColor: colors.background }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContent}
        >
          {/* User's Story Circle - First Position */}
          <TouchableOpacity
            style={styles.storyItem}
            onPress={() => {
              if (user && hasUserStories && user.id) {
                // Show user's own stories
                openUserStories(user.id, user.username, user.profilePicture);
              } else {
                // Navigate to create new story
                router.push('/(create)/newStory');
              }
            }}
          >
            <View style={hasUserStories ? styles.storyRing : styles.storyImageContainer}>
              <Image
                source={{
                  uri: hasUserStories && userLatestStory 
                    ? getStoryThumbnail(userLatestStory)
                    : (user && user.profilePicture) ? user.profilePicture : DEFAULT_PROFILE_PHOTO,
                }}
                style={styles.storyImage}
              />
              {!hasUserStories && (
                <View style={styles.addStoryIcon}>
                  <Ionicons name="add" size={20} color="white" />
                </View>
              )}
            </View>
            <Text style={[styles.storyLabel, { color: colors.text }]}>
              {hasUserStories ? 'Your note' : 'Post a note'}
            </Text>
          </TouchableOpacity>

          {/* Other Users' Stories */}
          {uniqueStoryUsers
            .filter(story => story.userId !== (user?.id || ''))
            .map((story) => {
              const latestStory = getLatestStoryForUser(story.userId);
              return (
                <TouchableOpacity
                  key={story.id}
                  style={styles.storyItem}
                  onPress={() => story.userId && openUserStories(story.userId, story.username, story.profilePicture)}
                >
                  <View style={styles.storyRing}>
                    <Image
                      source={{
                        uri: getStoryThumbnail(latestStory || story),
                      }}
                      style={styles.storyImage}
                    />
                  </View>
                  <Text style={[styles.storyLabel, { color: colors.text }]} numberOfLines={1}>
                    {story.username}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      </View>

      {/* Navigation Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.card }]}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {tabs.map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[
                styles.tabButton, 
                activeTab === tab && styles.tabButtonActive,
                activeTab === tab && { backgroundColor: colors.primary + '20' }
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText, 
                { color: colors.lightText },
                activeTab === tab && { color: colors.primary, fontWeight: 'bold' }
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Chats List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredChats}
          keyExtractor={item => item.id?.toString()}
          renderItem={renderChatItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubble-outline" size={48} color={colors.lightText} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Messages Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>Start a conversation with friends</Text>
              <TouchableOpacity 
                style={[styles.newMessageBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(create)/newMessage")}
              >
                <Text style={styles.newMessageBtnText}>New Message</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Story Viewer Modal */}
      {storyViewerVisible && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setStoryViewerVisible(false)}>
          <View style={styles.storyViewerContainer}>
            {currentUserStories.length > 0 && (
              <FlatList
                data={currentUserStories}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                initialScrollIndex={currentStoryIndex}
                renderItem={({ item }) => (
                  item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.mov') ? (
                    <View style={styles.storyVideoContainer}>
                      <Text style={styles.storyVideoPlaceholder}>Video Story</Text>
                      <Text style={styles.storyVideoText}>Tap to view video</Text>
                    </View>
                  ) : (
                    <Image source={{ uri: item.mediaUrl }} style={styles.storyImageFull} />
                  )
                )}
              />
            )}
            <TouchableOpacity style={styles.closeStoryButton} onPress={() => setStoryViewerVisible(false)}>
              <Ionicons name="close" size={36} color="#fff" />
            </TouchableOpacity>
            <View style={styles.storyHeader}>
              <Image 
                source={{ uri: currentStoryUser?.profilePicture || DEFAULT_PROFILE_PHOTO }} 
                style={styles.storyUserAvatar} 
              />
              <Text style={styles.storyUsername}>{currentStoryUser?.username}</Text>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function formatDateTime(isoString?: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  storiesContainer: {
    paddingVertical: 8,
  },
  storiesContent: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#FF7F11',
  },
  storyImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  storyImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4361EE',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  storyLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  tabsContainer: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabsRow: {
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  tabButtonActive: {
    backgroundColor: '#4361EE20',
  },
  tabText: {
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chatImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  chatImage: {
    width: '100%',
    height: '100%',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#31a24c',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
    marginLeft: 12,
  },
  chatName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  chatMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  chatDate: {
    fontSize: 12,
  },
  unreadBadge: {
    backgroundColor: '#4361EE',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  newMessageBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 20,
  },
  newMessageBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  storyViewerContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeStoryButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  storyHeader: {
    position: 'absolute',
    top: 60,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  storyUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: '#FF7F11',
  },
  storyUsername: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  storyVideoContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  storyVideoPlaceholder: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  storyVideoText: {
    color: 'white',
    fontSize: 16,
  },
});