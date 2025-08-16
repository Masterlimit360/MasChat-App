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
import { memoriesService, Memory, MemoryStats } from '../lib/services/memoriesService';
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



export default function MemoriesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [memories, setMemories] = useState<Memory[]>([]);
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'posts' | 'stories' | 'reels' | 'photos'>('all');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, [activeFilter, selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [memoriesData, statsData] = await Promise.all([
        memoriesService.getMemories(activeFilter, selectedYear),
        memoriesService.getMemoryStats()
      ]);

      setMemories(memoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading memories:', error);
      Alert.alert('Error', 'Failed to load memories');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filteredMemories = memories.filter(memory => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'posts') return memory.type === 'post';
    if (activeFilter === 'stories') return memory.type === 'story';
    if (activeFilter === 'reels') return memory.type === 'reel';
    if (activeFilter === 'photos') return memory.type === 'photo';
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return 'document-text';
      case 'story': return 'add-circle';
      case 'reel': return 'videocam';
      case 'photo': return 'image';
      default: return 'document-text';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'post': return colors.primary;
      case 'story': return colors.accent;
      case 'reel': return colors.success;
      case 'photo': return colors.gold;
      default: return colors.primary;
    }
  };

  const renderMemoryCard = ({ item }: { item: Memory }) => (
    <TouchableOpacity 
      style={[styles.memoryCard, { backgroundColor: colors.card }]}
      onPress={() => {
        if (item.type === 'post') router.push(`/screens/PostViewerScreen?id=${item.id}`);
        else if (item.type === 'story') router.push(`/screens/StoryViewerScreen?id=${item.id}`);
        else if (item.type === 'reel') router.push(`/screens/ReelViewerScreen?id=${item.id}`);
      }}
    >
      <View style={styles.memoryImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.memoryImage} />
        {item.isVideo && (
          <View style={styles.videoOverlay}>
            <Ionicons name="play-circle" size={32} color="white" />
            <Text style={styles.videoDuration}>{item.duration}</Text>
          </View>
        )}
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getTypeIcon(item.type) as any} size={12} color="white" />
        </View>
      </View>
      
      <View style={styles.memoryContent}>
        <Text style={[styles.memoryTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.memoryDescription, { color: colors.lightText }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.memoryStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color="#FF6B6B" />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.comments}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="share" size={14} color={colors.success} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.shares}</Text>
          </View>
        </View>
        
        <Text style={[styles.memoryDate, { color: colors.lightText }]}>{item.date}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Memory Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalMemories || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{stats?.thisYear || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>This Year</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats?.thisMonth || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>This Month</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.gold }]}>{stats?.thisWeek || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>This Week</Text>
        </View>
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={[styles.filtersCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Filter Memories</Text>
      
      {/* Type Filters */}
      <View style={styles.filterRow}>
        {(['all', 'posts', 'stories', 'reels', 'photos'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && { backgroundColor: colors.primary }
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              { color: activeFilter === filter ? 'white' : colors.text }
            ]}>
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Year Filter */}
      <View style={styles.yearFilter}>
        <Text style={[styles.yearLabel, { color: colors.lightText }]}>Year:</Text>
        <TouchableOpacity
          style={[styles.yearButton, { backgroundColor: colors.border }]}
          onPress={() => {
            const years = [2024, 2023, 2022, 2021];
            const currentIndex = years.indexOf(selectedYear);
            const nextIndex = (currentIndex + 1) % years.length;
            setSelectedYear(years[nextIndex]);
          }}
        >
          <Text style={[styles.yearText, { color: colors.text }]}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={16} color={colors.lightText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Memories" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading memories...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Memories" showBackButton={true} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {renderStats()}
        {renderFilters()}
        
        <View style={styles.memoriesContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeFilter === 'all' ? 'All Memories' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}`} ({filteredMemories.length})
          </Text>
          
          {filteredMemories.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="history" size={64} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>
                No memories found for this filter
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredMemories}
              renderItem={renderMemoryCard}
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
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
  yearFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yearLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '500',
  },
  memoriesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  memoryCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoryImageContainer: {
    position: 'relative',
    width: 120,
    height: 120,
  },
  memoryImage: {
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
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoryContent: {
    flex: 1,
    padding: 12,
  },
  memoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  memoryDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  memoryStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  memoryDate: {
    fontSize: 12,
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