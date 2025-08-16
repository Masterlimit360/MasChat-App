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

interface AdCampaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  adType: 'banner' | 'video' | 'story' | 'feed';
}

interface AdStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSpent: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
  averageCPC: number;
}

interface AdTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  type: 'banner' | 'video' | 'story' | 'feed';
  price: number;
  duration: string;
  features: string[];
}

export default function AdCenterScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [stats, setStats] = useState<AdStats | null>(null);
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'templates' | 'analytics'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      const mockCampaigns: AdCampaign[] = [
        {
          id: '1',
          title: 'Summer Sale Campaign',
          description: 'Promote summer clothing and accessories',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
          status: 'active',
          budget: 500,
          spent: 234.50,
          impressions: 15420,
          clicks: 456,
          ctr: 2.96,
          cpc: 0.51,
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          targetAudience: 'Fashion enthusiasts, 18-35',
          adType: 'banner'
        },
        {
          id: '2',
          title: 'Tech Product Launch',
          description: 'Launch campaign for new smartphone',
          imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
          status: 'paused',
          budget: 1000,
          spent: 567.80,
          impressions: 23450,
          clicks: 789,
          ctr: 3.36,
          cpc: 0.72,
          startDate: '2024-01-15',
          endDate: '2024-02-15',
          targetAudience: 'Tech enthusiasts, 25-45',
          adType: 'video'
        },
        {
          id: '3',
          title: 'Restaurant Promotion',
          description: 'Promote new menu items and special offers',
          imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
          status: 'completed',
          budget: 300,
          spent: 300.00,
          impressions: 8900,
          clicks: 234,
          ctr: 2.63,
          cpc: 1.28,
          startDate: '2023-12-01',
          endDate: '2023-12-31',
          targetAudience: 'Food lovers, local area',
          adType: 'story'
        }
      ];

      const mockTemplates: AdTemplate[] = [
        {
          id: '1',
          name: 'Banner Ad Package',
          description: 'Standard banner ad placement for 30 days',
          imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          type: 'banner',
          price: 100,
          duration: '30 days',
          features: ['Banner placement', 'Target audience', 'Basic analytics', '24/7 support']
        },
        {
          id: '2',
          name: 'Video Ad Package',
          description: 'Premium video ad with high engagement',
          imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400',
          type: 'video',
          price: 250,
          duration: '30 days',
          features: ['Video placement', 'Advanced targeting', 'Detailed analytics', 'Creative support']
        },
        {
          id: '3',
          name: 'Story Ad Package',
          description: 'Interactive story ads for maximum reach',
          imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
          type: 'story',
          price: 150,
          duration: '30 days',
          features: ['Story placement', 'Interactive elements', 'Engagement tracking', 'Custom design']
        },
        {
          id: '4',
          name: 'Feed Ad Package',
          description: 'Native feed ads that blend seamlessly',
          imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
          type: 'feed',
          price: 200,
          duration: '30 days',
          features: ['Feed placement', 'Native design', 'Performance tracking', 'A/B testing']
        }
      ];

      setCampaigns(mockCampaigns);
      setTemplates(mockTemplates);
      setStats({
        totalCampaigns: 3,
        activeCampaigns: 1,
        totalSpent: 1103.30,
        totalImpressions: 47770,
        totalClicks: 1479,
        averageCTR: 3.10,
        averageCPC: 0.75
      });
    } catch (error) {
      console.error('Error loading ad center data:', error);
      Alert.alert('Error', 'Failed to load ad center data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const createCampaign = () => {
    Alert.alert('Create Campaign', 'Campaign creation coming soon!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.success;
      case 'paused': return colors.accent;
      case 'completed': return colors.primary;
      case 'draft': return colors.lightText;
      default: return colors.primary;
    }
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return 'image';
      case 'video': return 'videocam';
      case 'story': return 'add-circle';
      case 'feed': return 'newspaper';
      default: return 'image';
    }
  };

  const renderCampaignCard = ({ item }: { item: AdCampaign }) => (
    <TouchableOpacity 
      style={[styles.campaignCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert(item.title, `Budget: $${item.budget}\nSpent: $${item.spent}\nImpressions: ${item.impressions.toLocaleString()}`)}
    >
      <View style={styles.campaignImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.campaignImage} />
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <View style={styles.adTypeBadge}>
          <Ionicons name={getAdTypeIcon(item.adType) as any} size={16} color="white" />
        </View>
      </View>
      
      <View style={styles.campaignContent}>
        <Text style={[styles.campaignTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        
        <Text style={[styles.campaignDescription, { color: colors.lightText }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.campaignStats}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Budget</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>${item.budget}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>Spent</Text>
              <Text style={[styles.statValue, { color: colors.accent }]}>${item.spent}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: colors.lightText }]}>CTR</Text>
              <Text style={[styles.statValue, { color: colors.success }]}>{item.ctr}%</Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(item.spent / item.budget) * 100}%`,
                  backgroundColor: colors.primary 
                }
              ]} 
            />
          </View>
        </View>
        
        <View style={styles.campaignFooter}>
          <Text style={[styles.targetAudience, { color: colors.lightText }]} numberOfLines={1}>
            {item.targetAudience}
          </Text>
          <Text style={[styles.campaignDate, { color: colors.lightText }]}>
            {item.startDate} - {item.endDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTemplateCard = ({ item }: { item: AdTemplate }) => (
    <TouchableOpacity 
      style={[styles.templateCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert(item.name, `Price: $${item.price}\nDuration: ${item.duration}\n\nFeatures:\n${item.features.join('\n')}`)}
    >
      <View style={styles.templateImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.templateImage} />
        <View style={[styles.priceBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.priceText}>${item.price}</Text>
        </View>
      </View>
      
      <View style={styles.templateContent}>
        <Text style={[styles.templateName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.templateDescription, { color: colors.lightText }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.templateFeatures}>
          {item.features.slice(0, 2).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.lightText }]}>{feature}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: colors.primary }]}
          onPress={() => Alert.alert('Select Package', `Selected: ${item.name}`)}
        >
          <Text style={styles.selectButtonText}>Select Package</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.statGradient}
          >
            <MaterialIcons name="campaign" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.totalCampaigns || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Campaigns</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.success, '#66D9FF']}
            style={styles.statGradient}
          >
            <MaterialIcons name="trending-up" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{stats?.activeCampaigns || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Active</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.accent, '#FFA366']}
            style={styles.statGradient}
          >
            <MaterialIcons name="attach-money" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>${stats?.totalSpent || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Spent</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.gold, '#FFE55C']}
            style={styles.statGradient}
          >
            <MaterialIcons name="visibility" size={24} color="white" />
          </LinearGradient>
          <Text style={[styles.statNumber, { color: colors.text }]}>{(stats?.totalImpressions || 0).toLocaleString()}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Impressions</Text>
        </View>
      </View>

      {/* Performance Metrics */}
      <View style={[styles.performanceCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance Metrics</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.success }]}>{stats?.averageCTR || 0}%</Text>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Avg CTR</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.accent }]}>${stats?.averageCPC || 0}</Text>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Avg CPC</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={[styles.metricNumber, { color: colors.primary }]}>{stats?.totalClicks || 0}</Text>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Total Clicks</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={[styles.quickActionsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={createCampaign}
          >
            <MaterialIcons name="add-circle" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Create Campaign</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Analytics', 'Detailed analytics coming soon!')}
          >
            <MaterialIcons name="analytics" size={24} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>View Analytics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Templates', 'Ad templates coming soon!')}
          >
            <MaterialIcons name="template" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>Ad Templates</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Support', 'Ad support coming soon!')}
          >
            <MaterialIcons name="support-agent" size={24} color={colors.secondary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Get Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderCampaigns = () => (
    <View style={styles.tabContent}>
      <View style={styles.campaignsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Campaigns</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={createCampaign}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createButtonText}>New Campaign</Text>
        </TouchableOpacity>
      </View>
      
      {campaigns.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bullhorn-outline" size={64} color={colors.lightText} />
          <Text style={[styles.emptyText, { color: colors.lightText }]}>
            No campaigns yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={campaigns}
          renderItem={renderCampaignCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderTemplates = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Ad Templates</Text>
      <FlatList
        data={templates}
        renderItem={renderTemplateCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <View style={[styles.analyticsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Campaign Analytics</Text>
        
        <View style={styles.analyticsChart}>
          <MaterialIcons name="insert-chart" size={48} color={colors.lightText} />
          <Text style={[styles.chartText, { color: colors.lightText }]}>Analytics charts coming soon</Text>
        </View>
        
        <View style={styles.analyticsMetrics}>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Total Reach</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{(stats?.totalImpressions || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Total Engagement</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{stats?.totalClicks || 0}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={[styles.metricLabel, { color: colors.lightText }]}>Average CTR</Text>
            <Text style={[styles.metricValue, { color: colors.text }]}>{stats?.averageCTR || 0}%</Text>
          </View>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Ad Center" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading ad center...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Ad Center" showBackButton={true} />
      
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'overview' ? colors.primary : colors.lightText }]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'campaigns' && styles.activeTab]}
          onPress={() => setActiveTab('campaigns')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'campaigns' ? colors.primary : colors.lightText }]}>
            Campaigns
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'templates' && styles.activeTab]}
          onPress={() => setActiveTab('templates')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'templates' ? colors.primary : colors.lightText }]}>
            Templates
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'analytics' ? colors.primary : colors.lightText }]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'campaigns' && renderCampaigns()}
        {activeTab === 'templates' && renderTemplates()}
        {activeTab === 'analytics' && renderAnalytics()}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
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
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: (width - 48) / 2,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  performanceCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
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
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
  },
  quickActionsCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  campaignsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  campaignCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignImageContainer: {
    position: 'relative',
    height: 150,
  },
  campaignImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  adTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  campaignContent: {
    padding: 16,
  },
  campaignTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  campaignDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  campaignStats: {
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  campaignFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetAudience: {
    fontSize: 12,
    flex: 1,
  },
  campaignDate: {
    fontSize: 12,
  },
  templateCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateImageContainer: {
    position: 'relative',
    height: 120,
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  templateContent: {
    padding: 16,
  },
  templateName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  templateFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    marginLeft: 6,
  },
  selectButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  analyticsCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsChart: {
    height: 200,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartText: {
    marginTop: 8,
    fontSize: 14,
  },
  analyticsMetrics: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
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