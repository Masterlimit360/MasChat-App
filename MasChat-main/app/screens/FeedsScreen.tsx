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

interface FeedItem {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  source: string;
  category: string;
  publishDate: string;
  readTime: string;
  isBookmarked: boolean;
  isRead: boolean;
  tags: string[];
}

interface FeedCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export default function FeedsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [feeds, setFeeds] = useState<FeedItem[]>([]);
  const [categories, setCategories] = useState<FeedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'trending' | 'latest' | 'bookmarked'>('trending');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      const mockCategories: FeedCategory[] = [
        { id: 'tech', name: 'Technology', icon: 'laptop', color: colors.primary, count: 45 },
        { id: 'news', name: 'News', icon: 'newspaper', color: colors.accent, count: 32 },
        { id: 'sports', name: 'Sports', icon: 'football', color: colors.success, count: 28 },
        { id: 'entertainment', name: 'Entertainment', icon: 'film', color: colors.gold, count: 23 },
        { id: 'science', name: 'Science', icon: 'flask', color: colors.secondary, count: 19 },
        { id: 'business', name: 'Business', icon: 'briefcase', color: colors.bronze, count: 15 }
      ];

      const mockFeeds: FeedItem[] = [
        {
          id: '1',
          title: 'Latest AI Breakthroughs in 2024',
          description: 'Discover the most recent advancements in artificial intelligence and machine learning.',
          content: 'Artificial intelligence continues to evolve at an unprecedented pace...',
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
          source: 'TechCrunch',
          category: 'tech',
          publishDate: '2024-01-15',
          readTime: '5 min read',
          isBookmarked: false,
          isRead: false,
          tags: ['AI', 'Machine Learning', 'Technology']
        },
        {
          id: '2',
          title: 'Global Economic Trends for 2024',
          description: 'An analysis of the major economic trends that will shape the global market this year.',
          content: 'The global economy is facing unprecedented challenges and opportunities...',
          imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
          source: 'Bloomberg',
          category: 'business',
          publishDate: '2024-01-14',
          readTime: '8 min read',
          isBookmarked: true,
          isRead: true,
          tags: ['Economy', 'Finance', 'Global Markets']
        },
        {
          id: '3',
          title: 'Space Exploration: Mars Mission Update',
          description: 'Latest updates on the ongoing Mars exploration missions and discoveries.',
          content: 'NASA\'s Perseverance rover continues to make groundbreaking discoveries...',
          imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400',
          source: 'Space.com',
          category: 'science',
          publishDate: '2024-01-13',
          readTime: '6 min read',
          isBookmarked: false,
          isRead: false,
          tags: ['Space', 'Mars', 'NASA']
        },
        {
          id: '4',
          title: 'Championship Finals: Epic Showdown',
          description: 'The most anticipated sports event of the year is just around the corner.',
          content: 'Two legendary teams will face off in what promises to be...',
          imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          source: 'ESPN',
          category: 'sports',
          publishDate: '2024-01-12',
          readTime: '4 min read',
          isBookmarked: false,
          isRead: false,
          tags: ['Sports', 'Championship', 'Football']
        },
        {
          id: '5',
          title: 'Hollywood\'s Biggest Night: Awards Preview',
          description: 'Everything you need to know about the upcoming awards season.',
          content: 'The film industry is gearing up for its most prestigious night...',
          imageUrl: 'https://images.unsplash.com/photo-1489599835382-957593cb2371?w=400',
          source: 'Variety',
          category: 'entertainment',
          publishDate: '2024-01-11',
          readTime: '7 min read',
          isBookmarked: true,
          isRead: false,
          tags: ['Hollywood', 'Awards', 'Movies']
        }
      ];

      setCategories(mockCategories);
      setFeeds(mockFeeds);
    } catch (error) {
      console.error('Error loading feeds:', error);
      Alert.alert('Error', 'Failed to load feeds');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredFeeds = feeds.filter(feed => {
    if (activeCategory === 'all') return true;
    return feed.category === activeCategory;
  });

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || colors.primary;
  };

  const toggleBookmark = (feedId: string) => {
    setFeeds(prevFeeds => 
      prevFeeds.map(feed => 
        feed.id === feedId 
          ? { ...feed, isBookmarked: !feed.isBookmarked }
          : feed
      )
    );
  };

  const renderFeedCard = ({ item }: { item: FeedItem }) => (
    <TouchableOpacity 
      style={[styles.feedCard, { backgroundColor: colors.card }]}
      onPress={() => {
        // Mark as read and navigate to full article
        setFeeds(prevFeeds => 
          prevFeeds.map(feed => 
            feed.id === item.id 
              ? { ...feed, isRead: true }
              : feed
          )
        );
        // Navigate to article viewer
        router.push(`/screens/ArticleViewerScreen?id=${item.id}`);
      }}
    >
      <View style={styles.feedImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.feedImage} />
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
        </View>
        <TouchableOpacity
          style={styles.bookmarkButton}
          onPress={() => toggleBookmark(item.id)}
        >
          <Ionicons 
            name={item.isBookmarked ? "bookmark" : "bookmark-outline"} 
            size={20} 
            color={item.isBookmarked ? colors.accent : colors.lightText} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.feedContent}>
        <View style={styles.feedHeader}>
          <Text style={[styles.feedSource, { color: colors.accent }]}>{item.source}</Text>
          <Text style={[styles.feedDate, { color: colors.lightText }]}>{item.publishDate}</Text>
        </View>
        
        <Text style={[styles.feedTitle, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={[styles.feedDescription, { color: colors.lightText }]} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.feedFooter}>
          <Text style={[styles.readTime, { color: colors.lightText }]}>{item.readTime}</Text>
          {!item.isRead && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>NEW</Text>
            </View>
          )}
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

  const renderCategories = () => (
    <View style={[styles.categoriesCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            activeCategory === 'all' && { backgroundColor: colors.primary }
          ]}
          onPress={() => setActiveCategory('all')}
        >
          <Text style={[
            styles.categoryButtonText,
            { color: activeCategory === 'all' ? 'white' : colors.text }
          ]}>
            All
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && { backgroundColor: category.color }
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons 
              name={category.icon as any} 
              size={16} 
              color={activeCategory === category.id ? 'white' : category.color} 
            />
            <Text style={[
              styles.categoryButtonText,
              { color: activeCategory === category.id ? 'white' : colors.text }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
        onPress={() => setActiveTab('trending')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'trending' ? colors.primary : colors.lightText }]}>
          Trending
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'latest' && styles.activeTab]}
        onPress={() => setActiveTab('latest')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'latest' ? colors.primary : colors.lightText }]}>
          Latest
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'bookmarked' && styles.activeTab]}
        onPress={() => setActiveTab('bookmarked')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'bookmarked' ? colors.primary : colors.lightText }]}>
          Bookmarked
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Feeds" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading feeds...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Feeds" showBackButton={true} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {renderTabs()}
        {renderCategories()}
        
        <View style={styles.feedsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeTab === 'trending' ? 'Trending' : activeTab === 'latest' ? 'Latest' : 'Bookmarked'} Feeds
          </Text>
          
          {filteredFeeds.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="rss" size={64} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>
                No feeds found for this category
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredFeeds}
              renderItem={renderFeedCard}
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
  tabsCard: {
    margin: 16,
    marginBottom: 8,
    padding: 4,
    borderRadius: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoriesCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
    gap: 6,
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  feedsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  feedCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedImageContainer: {
    position: 'relative',
    height: 200,
  },
  feedImage: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkButton: {
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
  feedContent: {
    padding: 16,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedSource: {
    fontSize: 12,
    fontWeight: '600',
  },
  feedDate: {
    fontSize: 12,
  },
  feedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    lineHeight: 24,
  },
  feedDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  feedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  readTime: {
    fontSize: 12,
  },
  unreadBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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