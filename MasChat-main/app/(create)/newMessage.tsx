import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { friendService } from '../lib/services/friendService';
import ModernHeader from '../../components/ModernHeader';

// Color Palette (matching home/friends screens)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

export default function NewMessage() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]); // Changed to any[] as User type is removed
  const [friends, setFriends] = useState<any[]>([]); // Changed to any[] as User type is removed
  const [suggestions, setSuggestions] = useState<any[]>([]); // Changed to any[] as User type is removed
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadFriends();
      loadSuggestions();
    }
  }, [user?.id]);

  // Refresh friends when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      if (user?.id) {
        loadFriends();
        loadSuggestions();
      }
    }, [user?.id])
  );

  const loadFriends = async () => {
    if (!user?.id) return;
    setFriendsLoading(true);
    try {
      console.log('Loading friends for user:', user.id);
      const friendsData = await friendService.getFriends(user.id);
      console.log('Friends loaded:', friendsData.length, friendsData);
      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
      setFriends([]);
    } finally {
      setFriendsLoading(false);
    }
  };

  const loadSuggestions = async () => {
    if (!user?.id) return;
    try {
      // Use messenger suggestions instead of regular suggestions
      const suggestionsData = await friendService.getMessengerSuggestions(user.id);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error loading messenger suggestions:', error);
      setSuggestions([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([loadFriends(), loadSuggestions()]);
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }
    
    setSearchLoading(true);
    try {
      const searchResults = await friendService.searchUsers(search.trim());
      setUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const sendFriendRequest = async (recipientId: string) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await friendService.sendFriendRequest(user.id, recipientId);
      // Refresh suggestions after sending request
      loadSuggestions();
      // Show success feedback (you can add a toast notification here)
      console.log('Friend request sent successfully');
    } catch (error) {
      console.error('Error sending friend request:', error);
      // Show error feedback
      console.log('Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const startConversation = (recipient: any) => { // Changed to any as User type is removed
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(recipient) }
    });
  };

  // AI image generation for direct message
  const generateAIImageAndSend = async (recipient: any) => { // Changed to any as User type is removed
    Alert.prompt('AI Image Message', 'Describe the image to send:', async (prompt) => {
      if (!prompt) return;
      setAiLoading(true);
      try {
        const url = 'https://open-ai21.p.rapidapi.com/texttoimage2';
        const options = {
          method: 'POST',
          headers: {
            'x-rapidapi-key': '355060685fmsh742abd58eb438d7p1f4d66jsn22cd506769c9',
            'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: prompt }),
        };
        const response = await fetch(url, options);
        const result = await response.json();
        if (result && result.generated_image) {
          // Navigate to chat screen with the generated image
          router.push({
            pathname: '/screens/ChatScreen',
            params: { recipient: JSON.stringify(recipient), aiImage: result.generated_image }
          });
        } else {
          Alert.alert('Error', 'Failed to generate image.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to generate image.');
      } finally {
        setAiLoading(false);
      }
    });
  };

  const renderUserItem = ({ item }: { item: any }) => ( // Changed to any as User type is removed
    <TouchableOpacity 
      style={styles.userItem}
      onPress={() => startConversation(item)}
      onLongPress={() => generateAIImageAndSend(item)}
    >
      <View 
        style={styles.userAvatar} 
      >
        <Ionicons name="person" size={24} color={COLORS.primary} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName || item.username}</Text>
        <Text style={styles.userUsername}>@{item.username}</Text>
      </View>
      {!item.isFriend && (
        <TouchableOpacity 
          style={styles.addFriendBtn}
          onPress={() => sendFriendRequest(item.id)}
          disabled={loading}
        >
          <Ionicons name="person-add" size={20} color={COLORS.accent} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ModernHeader title="New Message" onBack={() => router.back()} />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchLoading && <ActivityIndicator size="small" color={COLORS.primary} />}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Search Results */}
        {search.trim() && (
          <>
            {renderSectionHeader('Search Results')}
            {users.map(user => (
              <View key={user.id} style={styles.userItem}>
                <View 
                  style={styles.userAvatar} 
                >
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.fullName || user.username}</Text>
                  <Text style={styles.userUsername}>@{user.username}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.addFriendBtn}
                  onPress={() => sendFriendRequest(user.id)}
                  disabled={loading}
                >
                  <Ionicons name="person-add" size={20} color={COLORS.accent} />
                </TouchableOpacity>
              </View>
            ))}
            {users.length === 0 && search.trim() && !searchLoading && (
              <Text style={styles.noResults}>No users found</Text>
            )}
          </>
        )}

        {/* Friends Section - Always show when friends exist, regardless of search */}
        {!search.trim() && (
          <>
            {friendsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Loading friends...</Text>
              </View>
            ) : friends.length > 0 ? (
              <>
                {renderSectionHeader('Friends')}
                {friends.map(friend => (
                  <TouchableOpacity 
                    key={friend.id} 
                    style={styles.userItem}
                    onPress={() => startConversation(friend)}
                  >
                    <View 
                      style={styles.userAvatar} 
                    >
                      <Ionicons name="person" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{friend.fullName || friend.username}</Text>
                      <Text style={styles.userUsername}>@{friend.username}</Text>
                    </View>
                    <TouchableOpacity style={styles.messageBtn}>
                      <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </>
            ) : null}
          </>
        )}

        {/* Suggestions - Only show when no search and no friends */}
        {!search.trim() && !friendsLoading && friends.length === 0 && suggestions.length > 0 && (
          <>
            {renderSectionHeader('Friends You Haven\'t Chatted With')}
            {suggestions.map(suggestion => (
              <View key={suggestion.id} style={styles.userItem}>
                <View 
                  style={styles.userAvatar} 
                >
                  <Ionicons name="person" size={24} color={COLORS.primary} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{suggestion.fullName || suggestion.username}</Text>
                  <Text style={styles.userUsername}>@{suggestion.username}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.messageBtn}
                  onPress={() => startConversation(suggestion)}
                >
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Empty State - Only show when no search, no friends, and no suggestions */}
        {!search.trim() && !friendsLoading && friends.length === 0 && suggestions.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={COLORS.lightText} />
            <Text style={styles.emptyTitle}>No Friends Yet</Text>
            <Text style={styles.emptySubtitle}>Add friends to start messaging</Text>
            <TouchableOpacity 
              style={styles.addFriendsButton}
              onPress={() => router.push('/friends/SuggestionsScreen')}
            >
              <Text style={styles.addFriendsButtonText}>Find Friends</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Debug Info - Only show in development */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>User ID: {user?.id || 'Not set'}</Text>
            <Text style={styles.debugText}>Friends Loading: {friendsLoading ? 'Yes' : 'No'}</Text>
            <Text style={styles.debugText}>Friends Count: {friends.length}</Text>
            <Text style={styles.debugText}>Suggestions Count: {suggestions.length}</Text>
            <Text style={styles.debugText}>Search Active: {search.trim() ? 'Yes' : 'No'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 44,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  userUsername: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  addFriendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: COLORS.lightText,
    padding: 20,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.lightText,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 20,
  },
  addFriendsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFriendsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  debugContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});