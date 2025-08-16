import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image, ScrollView, StyleSheet, StatusBar, Platform, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { friendService } from '../lib/services/friendService';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function FriendsScreen() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImage, setAiImage] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchFriends = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching friends for user:', user.id);
      const data = await friendService.getFriends(user.id);
      console.log('Friends data received:', data);
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setError('Failed to load friends. Please try again.');
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchFriends();
    }, [user?.id])
  );

  const handleRetry = () => {
    fetchFriends();
  };

  const uniqueFriends = Array.from(new Map(friends.map(f => [f.id, f])).values());
  const filteredFriends = uniqueFriends.filter(f => 
    f.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    f.username?.toLowerCase().includes(search.toLowerCase())
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading friends...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.accent} />
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (filteredFriends.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>
            {search ? 'No friends found matching your search' : 'No friends yet'}
          </Text>
          {!search && (
            <TouchableOpacity 
              style={styles.addFriendsButton}
              onPress={() => router.push('/friends/SuggestionsScreen')}
            >
              <LinearGradient
                colors={[COLORS.primary, '#2B6CD9']}
                style={styles.addFriendsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addFriendsText}>Find Friends</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return filteredFriends.map(friend => (
      <View key={friend.id} style={styles.friendItem}>
        <TouchableOpacity onPress={() => router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: friend.id } })}>
          <Image 
            source={{ uri: friend.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
            style={styles.friendAvatar} 
          />
        </TouchableOpacity>
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{friend.fullName || friend.username}</Text>
          <Text style={styles.friendUsername}>@{friend.username}</Text>
        </View>
        <TouchableOpacity 
          style={styles.messageButton} 
          onPress={() => router.push({ 
            pathname: '/screens/ChatScreen', 
            params: { 
              recipient: JSON.stringify({ 
                id: friend.id, 
                username: friend.username, 
                fullName: friend.fullName, 
                profilePicture: friend.profilePicture 
              }) 
            } 
          })}
        >
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent />
      
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
        style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.headerTitle}>Friends</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/friends/FriendRequestsScreen')}
          >
            <Ionicons name="person-add" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/friends/SuggestionsScreen')}
          >
            <Ionicons name="people-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.lightText} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search friends..."
            placeholderTextColor={COLORS.lightText}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    textAlign: 'center',
  },
  addFriendsButton: {
    marginTop: 20,
  },
  addFriendsGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addFriendsText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  friendUsername: {
    fontSize: 14,
    color: COLORS.lightText,
    marginTop: 2,
  },
  messageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
