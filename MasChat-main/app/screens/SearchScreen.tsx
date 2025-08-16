import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar, Platform, ActivityIndicator, ScrollView, Pressable, useColorScheme } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

// Modern Color Palette matching the app's theme
const COLORS = {
  light: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#F8F9FA',  // Light Gray
    card: '#FFFFFF',       // White
    text: '#212529',       // Dark Gray
    lightText: '#6C757D',  // Medium Gray
    border: '#E9ECEF',     // Light Border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',       // White
    lightText: '#B0B0B0',  // Light Gray
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'users', label: 'Users' },
  { key: 'posts', label: 'Posts' },
  { key: 'reels', label: 'Reels' },
];

const SUGGESTIONS = [
  'Football', 'iPhone', 'Jobs', 'Fashion', 'Apartment', 'Music', 'Pets', 'Laptop', 'Car', 'Camera', 'Shoes', 'Books', 'Beauty', 'Bicycle', 'Services', 'Home',
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [filter, setFilter] = useState('all');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  const currentColors = colors;

  useEffect(() => {
    loadRecent();
  }, []);

  const loadRecent = async () => {
    const stored = await AsyncStorage.getItem('recentSearches');
    if (stored) setRecent(JSON.parse(stored));
  };

  const saveRecent = async (q: string) => {
    let updated = [q, ...recent.filter(r => r !== q)].slice(0, 8);
    setRecent(updated);
    await AsyncStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecent = async () => {
    setRecent([]);
    await AsyncStorage.removeItem('recentSearches');
  };

  const handleSearch = async (q?: string) => {
    const searchTerm = typeof q === 'string' ? q : query;
    if (!searchTerm.trim()) return;
    setLoading(true);
    try {
      const [userRes, postRes, reelRes] = await Promise.all([
        client.get(`/users/search?query=${encodeURIComponent(searchTerm)}`),
        client.get(`/posts/search?query=${encodeURIComponent(searchTerm)}`),
        client.get(`/reels/search?query=${encodeURIComponent(searchTerm)}`),
      ]);
      setUsers(userRes.data);
      setPosts(postRes.data);
      setReels(reelRes.data);
      await saveRecent(searchTerm);
    } catch (e) {
      setUsers([]); setPosts([]); setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (type: string, item: any) => {
    if (type === 'user') {
      router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: item.id } });
    } else if (type === 'post') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Posts', postId: item.id } });
    } else if (type === 'reel') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Reels', reelId: item.id } });
    } else if (type === 'story') {
      router.push({ pathname: '/(tabs)/videos', params: { tab: 'Stories', storyId: item.id } });
    }
  };

  // Filtered results
  const showUsers = filter === 'all' || filter === 'users';
  const showPosts = filter === 'all' || filter === 'posts';
  const showReels = filter === 'all' || filter === 'reels';

  function highlight(text: string, term: string) {
    if (!term) return <Text style={{ color: currentColors.text }}>{text}</Text>;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return <Text style={{ color: currentColors.text }}>{parts.map((part, i) => part.toLowerCase() === term.toLowerCase() ? <Text key={i} style={{ backgroundColor: currentColors.accent + '40', fontWeight: 'bold', color: currentColors.accent }}>{part}</Text> : part)}</Text>;
  }

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar backgroundColor={currentColors.primary} barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} translucent />
      
      {/* Modern Header */}
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: currentColors.tabBarBg, borderBottomColor: currentColors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => {
              if (router.canGoBack?.()) {
                router.back();
              } else {
                router.replace('/(tabs)/menu');
              }
            }}
          >
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Search</Text>
          <View style={styles.headerSpacer} />
        </View>
      </BlurView>

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: currentColors.card, borderColor: currentColors.border }]}>
        <Ionicons name="search" size={20} color={currentColors.lightText} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: currentColors.text }]}
          placeholder="Search users, posts, reels..."
          placeholderTextColor={currentColors.lightText}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          onSubmitEditing={() => handleSearch()}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={currentColors.lightText} />
          </TouchableOpacity>
        )}
      </View>

      {/* Suggestions & Recent */}
      {isSearchFocused && !query.trim() && (
        <ScrollView style={styles.suggestionsScroll}>
          {recent.length > 0 && (
            <View style={styles.suggestionSection}>
              <View style={styles.suggestionHeader}>
                <Text style={[styles.suggestionTitle, { color: currentColors.text }]}>Recent Searches</Text>
                <TouchableOpacity onPress={clearRecent}>
                  <Text style={[styles.clearBtn, { color: currentColors.accent }]}>Clear</Text>
                </TouchableOpacity>
              </View>
              {recent.map((r, i) => (
                <TouchableOpacity key={i} style={styles.suggestionRow} onPress={() => { setQuery(r); handleSearch(r); }}>
                  <Ionicons name="time-outline" size={18} color={currentColors.lightText} style={{ marginRight: 8 }} />
                  <Text style={[styles.suggestionText, { color: currentColors.text }]}>{r}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.suggestionSection}>
            <Text style={[styles.suggestionTitle, { color: currentColors.text }]}>Suggestions</Text>
            <View style={styles.suggestionWrap}>
              {SUGGESTIONS.map((s, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.suggestionChip, { backgroundColor: currentColors.card, borderColor: currentColors.border }]} 
                  onPress={() => { setQuery(s); handleSearch(s); }}
                >
                  <Text style={[styles.suggestionChipText, { color: currentColors.text }]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {FILTERS.map(f => (
          <TouchableOpacity 
            key={f.key} 
            style={[
              styles.filterChip, 
              { backgroundColor: currentColors.card, borderColor: currentColors.border },
              filter === f.key && { backgroundColor: currentColors.primary }
            ]} 
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              styles.filterText, 
              { color: currentColors.text },
              filter === f.key && { color: '#FFFFFF' }
            ]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[...Array(4)].map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.loadingSkeleton, 
                { backgroundColor: currentColors.border, opacity: 0.5 }
              ]} 
            />
          ))}
        </View>
      ) : (
        <ScrollView style={styles.resultsScroll}>
          {/* Users */}
          {showUsers && users.length > 0 && (
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Users</Text>
          )}
          {showUsers && users.map(user => (
            <Pressable 
              key={user.id} 
              style={({ pressed }) => [
                styles.resultCard, 
                { backgroundColor: currentColors.card, borderColor: currentColors.border },
                pressed && { opacity: 0.7 }
              ]} 
              onPress={() => handleResultPress('user', user)}
            >
              <Image source={{ uri: user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
              <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, { color: currentColors.text }]}>
                  {highlight(user.fullName || user.username, query)}
                </Text>
                <Text style={[styles.resultSub, { color: currentColors.lightText }]}>
                  {highlight(user.username, query)}
                </Text>
              </View>
            </Pressable>
          ))}

          {/* Posts */}
          {showPosts && posts.length > 0 && (
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Posts</Text>
          )}
          {showPosts && posts.map(post => (
            <Pressable 
              key={post.id} 
              style={({ pressed }) => [
                styles.resultCard, 
                { backgroundColor: currentColors.card, borderColor: currentColors.border },
                pressed && { opacity: 0.7 }
              ]} 
              onPress={() => handleResultPress('post', post)}
            >
              <Ionicons name="document-text" size={28} color={currentColors.primary} style={styles.iconResult} />
              <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, { color: currentColors.text }]} numberOfLines={1}>
                  {highlight(post.content, query)}
                </Text>
                <Text style={[styles.resultSub, { color: currentColors.lightText }]}>
                  {highlight(post.user?.username || '', query)}
                </Text>
              </View>
            </Pressable>
          ))}

          {/* Reels */}
          {showReels && reels.length > 0 && (
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>Reels</Text>
          )}
          {showReels && reels.map(reel => (
            <Pressable 
              key={reel.id} 
              style={({ pressed }) => [
                styles.resultCard, 
                { backgroundColor: currentColors.card, borderColor: currentColors.border },
                pressed && { opacity: 0.7 }
              ]} 
              onPress={() => handleResultPress('reel', reel)}
            >
              <Image source={{ uri: reel.mediaUrl || 'https://i.imgur.com/6XbK6bE.jpg' }} style={styles.avatar} />
              <View style={styles.resultContent}>
                <Text style={[styles.resultTitle, { color: currentColors.text }]} numberOfLines={1}>
                  {highlight(reel.caption || reel.title || '', query)}
                </Text>
                <Text style={[styles.resultSub, { color: currentColors.lightText }]}>
                  {highlight(reel.user?.username || '', query)}
                </Text>
              </View>
            </Pressable>
          ))}

          {showUsers && users.length === 0 && showPosts && posts.length === 0 && showReels && reels.length === 0 && query.trim() !== '' && !loading && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search-outline" size={48} color={currentColors.lightText} />
              <Text style={[styles.noResults, { color: currentColors.lightText }]}>
                No results found. Try a different keyword or check the suggestions above!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    margin: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  suggestionsScroll: {
    maxHeight: 220,
    paddingHorizontal: 16,
  },
  suggestionSection: {
    marginBottom: 20,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearBtn: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  suggestionText: {
    fontSize: 15,
  },
  suggestionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  suggestionChipText: {
    fontWeight: '500',
    fontSize: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    borderWidth: 1,
  },
  filterText: {
    fontWeight: '500',
    fontSize: 14,
  },
  loadingContainer: {
    padding: 24,
  },
  loadingSkeleton: {
    borderRadius: 16,
    height: 60,
    marginBottom: 16,
  },
  resultsScroll: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eee',
  },
  iconResult: {
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  resultSub: {
    fontSize: 14,
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResults: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    paddingHorizontal: 32,
  },
});