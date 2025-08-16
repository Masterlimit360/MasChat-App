import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  useColorScheme,
  Image,
  FlatList
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ModernHeader from '../../components/ModernHeader';

const { width } = Dimensions.get('window');

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
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
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
    dark: '#1A1A2E',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
};

interface SavedItem {
  id: string;
  type: 'post' | 'story' | 'reel' | 'article' | 'video';
  title: string;
  description: string;
  imageUrl: string;
  author: string;
  authorAvatar: string;
  savedDate: string;
  category: string;
  tags: string[];
  isVideo?: boolean;
  duration?: string;
  likes: number;
  comments: number;
}

interface SavedStats {
  totalSaved: number;
  posts: number;
  stories: number;
  reels: number;
  articles: number;
  videos: number;
}

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [stats, setStats] = useState<SavedStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'stories' | 'reels' | 'articles' | 'videos'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      const mockSavedItems: SavedItem[] = [
        {
          id: '1',
          type: 'post',
          title: 'Amazing Photography Tips',
          description: 'Learn the best techniques for capturing stunning photos in any lighting condition.',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          author: 'John Doe',
          authorAvatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          savedDate: '2024-01-15',
          category: 'Photography',
          tags: ['photography', 'tips', 'lighting'],
          likes: 234,
          comments: 45
        },
        {
          id: '2',
          type: 'story',
          title: 'Travel Adventures',
          description: 'Exploring the hidden gems of Southeast Asia',
          imageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
          author: 'Jane Smith',
          authorAvatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          savedDate: '2024-01-14',
          category: 'Travel',
          tags: ['travel', 'adventure', 'asia'],
          likes: 156,
          comments: 23
        },
        {
          id: '3',
          type: 'reel',
          title: 'Dance Tutorial',
          description: 'Step-by-step guide to learning salsa moves',
          imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
          author: 'Mike Johnson',
          authorAvatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          savedDate: '2024-01-13',
          category: 'Dance',
          tags: ['dance', 'salsa', 'tutorial'],
          isVideo: true,
          duration: '2:30',
          likes: 567,
          comments: 78
        },
        {
          id: '4',
          type: 'article',
          title: 'AI in Modern Technology',
          description: 'How artificial intelligence is reshaping our digital world',
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
          author: 'Sarah Wilson',
          authorAvatar: 'https://randomuser.me/api/portraits/women/4.jpg',
          savedDate: '2024-01-12',
          category: 'Technology',
          tags: ['AI', 'technology', 'future'],
          likes: 89,
          comments: 12
        },
        {
          id: '5',
          type: 'video',
          title: 'Cooking Masterclass',
          description: 'Learn to cook authentic Italian pasta from scratch',
          imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
          author: 'Chef Maria',
          authorAvatar: 'https://randomuser.me/api/portraits/women/5.jpg',
          savedDate: '2024-01-11',
          category: 'Cooking',
          tags: ['cooking', 'italian', 'pasta'],
          isVideo: true,
          duration: '15:45',
          likes: 1234,
          comments: 234
        },
        {
          id: '6',
          type: 'post',
          title: 'Fitness Motivation',
          description: 'Transform your body with these proven workout routines',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          author: 'Alex Turner',
          authorAvatar: 'https://randomuser.me/api/portraits/men/6.jpg',
          savedDate: '2024-01-10',
          category: 'Fitness',
          tags: ['fitness', 'workout', 'motivation'],
          likes: 456,
          comments: 67
        }
      ];

      setSavedItems(mockSavedItems);
      setStats({
        totalSaved: 6,
        posts: 2,
        stories: 1,
        reels: 1,
        articles: 1,
        videos: 1
      });
    } catch (error) {
      console.error('Error loading saved items:', error);
      Alert.alert('Error', 'Failed to load saved items');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const removeSavedItem = (itemId: string) => {
    Alert.alert(
      'Remove Saved Item',
      'Are you sure you want to remove this item from your saved list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
            Alert.alert('Success', 'Item removed from saved list');
          }
        }
      ]
    );
  };

  const filteredItems = savedItems.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'posts') return item.type === 'post';
    if (activeFilter === 'stories') return item.type === 'story';
    if (activeFilter === 'reels') return item.type === 'reel';
    if (activeFilter === 'articles') return item.type === 'article';
    if (activeFilter === 'videos') return item.type === 'video';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return 'document-text';
      case 'story': return 'add-circle';
      case 'reel': return 'videocam';
      case 'article': return 'newspaper';
      case 'video': return 'play-circle';
      default: return 'document-text';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return colors.primary;
      case 'story': return colors.accent;
      case 'reel': return colors.success;
      case 'article': return colors.secondary;
      case 'video': return colors.gold;
      default: return colors.primary;
    }
  };

  const renderSavedItem = ({ item }: { item: SavedItem }) => (
    <TouchableOpacity 
      style={[styles.savedItemCard, { backgroundColor: colors.card }]}
      onPress={() => {
        // Navigate to the original content
        Alert.alert(item.title, `Viewing ${item.type}: ${item.description}`);
      }}
    >
      <View style={styles.itemImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
        {item.isVideo && (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={32} color="white" />
            <Text style={styles.videoDuration}>{item.duration}</Text>
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={12} color="white" />
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeSavedItem(item.id)}
        >
          <Ionicons name="close-circle" size={24} color={colors.lightText} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Image source={{ uri: item.authorAvatar }} style={styles.authorAvatar} />
          <View style={styles.authorInfo}>
            <Text style={[styles.authorName, { color: colors.text }]}>{item.author}</Text>
            <Text style={[styles.savedDate, { color: colors.lightText }]}>{item.savedDate}</Text>
          </View>
        </View>
        
        <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={[styles.itemDescription, { color: colors.lightText }]} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pricetag" size={14} color={colors.success} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: colors.border }]}>
              <Text style={[styles.tagText, { color: colors.lightText }]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Content Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalSaved || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Saved</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{stats?.posts || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats?.stories || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Stories</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.gold }]}>{stats?.reels || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Reels</Text>
        </View>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersCard, { backgroundColor: colors.card }]}>
      <View style={styles.filterHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter Content</Text>
        <TouchableOpacity
          style={styles.viewModeButton}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons 
            name={viewMode === 'grid' ? 'list' : 'grid'} 
            size={20} 
            color={colors.primary} 
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(['all', 'posts', 'stories', 'reels', 'articles', 'videos'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Ionicons 
              name={getTypeIcon(filter)} 
              size={16} 
              color={activeFilter === filter ? 'white' : getTypeColor(filter)} 
            />
            <Text style={[
              styles.filterText,
              { color: activeFilter === filter ? 'white' : colors.text }
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Saved" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading saved content...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Saved" showBackButton={true} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {renderStats()}
        {renderFilters()}
        
        <View style={styles.contentContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeFilter === 'all' ? 'All Saved Content' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`} ({filteredItems.length})
          </Text>
          
          {filteredItems.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="bookmark" size={64} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>
                No saved content found for this filter
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderSavedItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewModeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  savedItemCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImageContainer: {
    position: 'relative',
    height: 200,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoDuration: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemContent: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  savedDate: {
    fontSize: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  itemStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
}); 