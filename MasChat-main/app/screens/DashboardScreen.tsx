import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, WalletInfo, UserStats } from '../lib/services/massCoinService';
import { getBestFriends, getUserFriends } from '../lib/services/userService';
import MassCoinIcon from '../../components/MassCoinIcon';

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
    background: '#1A1A2E',
    card: '#2D2D44',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',
    success: '#4CC9F0',
    dark: '#1A1A2E',
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

interface DashboardStats {
  totalPosts: number;
  totalLikes: number;
  totalComments: number;
  totalFollowers: number;
  totalFollowing: number;
  totalViews: number;
  totalShares: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0,
    totalFollowing: 0,
    totalViews: 0,
    totalShares: 0,
  });
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadDashboardData();
    }
  }, [user?.id]);

  const loadDashboardData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [walletData, statsData, friendsData] = await Promise.all([
        massCoinService.getWallet(Number(user.id)),
        massCoinService.getUserStats(Number(user.id)),
        getUserFriends(user.id)
      ]);
      
      setWallet(walletData);
      setStats(statsData);
      setFriendCount(friendsData.length);
      
      // Mock dashboard stats (in real app, these would come from backend)
      setDashboardStats({
        totalPosts: Math.floor(Math.random() * 50) + 10,
        totalLikes: Math.floor(Math.random() * 500) + 100,
        totalComments: Math.floor(Math.random() * 200) + 50,
        totalFollowers: friendsData.length,
        totalFollowing: friendsData.length,
        totalViews: Math.floor(Math.random() * 10000) + 1000,
        totalShares: Math.floor(Math.random() * 100) + 20,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set default values
      setWallet(massCoinService.getMockWallet());
      setStats({
        totalTransactions: 0,
        totalVolume: 0,
        averageTransactionAmount: 0,
        totalTipsReceived: 0,
        totalTipsAmount: 0,
        totalTipsSent: 0,
        totalTipsSentAmount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderStatCard = (title: string, value: string | number, icon: string, color: string, onPress?: () => void) => (
    <TouchableOpacity 
      style={[styles.statCard, { backgroundColor: colors.card }]} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.lightText }]}>{title}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={[styles.welcomeSection, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.welcomeTitle}>Welcome back, {user?.fullName || user?.username || 'User'}!</Text>
            <Text style={styles.welcomeSubtitle}>Here's your activity overview</Text>
          </LinearGradient>
        </View>

        {/* MassCoin Wallet Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <MassCoinIcon size={24} />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>MassCoin Wallet</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/screens/MassCoinDashboardScreen')}>
              <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.walletInfo}>
            <View style={styles.walletBalance}>
              <Text style={[styles.balanceLabel, { color: colors.lightText }]}>Available Balance</Text>
              <Text style={[styles.balanceAmount, { color: colors.text }]}>
                {formatAmount(wallet?.balance || 0)} MASS
              </Text>
              <Text style={[styles.balanceUsd, { color: colors.lightText }]}>
                ≈ {massCoinService.formatUsdValue(wallet?.balance || 0)}
              </Text>
            </View>
            
            <View style={styles.walletStats}>
              <View style={styles.walletStat}>
                <Text style={[styles.walletStatValue, { color: colors.text }]}>
                  {formatAmount(wallet?.stakedAmount || 0)}
                </Text>
                <Text style={[styles.walletStatLabel, { color: colors.lightText }]}>Staked</Text>
              </View>
              <View style={styles.walletStat}>
                <Text style={[styles.walletStatValue, { color: colors.text }]}>
                  {stats?.totalTransactions || 0}
                </Text>
                <Text style={[styles.walletStatLabel, { color: colors.lightText }]}>Transactions</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Activity Stats */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Activity Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard('Posts', dashboardStats.totalPosts, 'document-text', colors.primary)}
            {renderStatCard('Likes', formatNumber(dashboardStats.totalLikes), 'heart', '#FF3040')}
            {renderStatCard('Comments', formatNumber(dashboardStats.totalComments), 'chatbubble', colors.accent)}
            {renderStatCard('Followers', formatNumber(dashboardStats.totalFollowers), 'people', colors.success)}
            {renderStatCard('Views', formatNumber(dashboardStats.totalViews), 'eye', colors.secondary)}
            {renderStatCard('Shares', formatNumber(dashboardStats.totalShares), 'share', '#A259E6')}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
              onPress={() => router.push('/(create)/newPost')}
            >
              <Ionicons name="add-circle" size={24} color={colors.primary} />
              <Text style={[styles.actionText, { color: colors.primary }]}>New Post</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.accent + '20' }]}
              onPress={() => router.push('/(create)/newReel')}
            >
              <Ionicons name="videocam" size={24} color={colors.accent} />
              <Text style={[styles.actionText, { color: colors.accent }]}>New Reel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
              onPress={() => router.push('/screens/MassCoinSendScreen')}
            >
              <MassCoinIcon size={24} />
              <Text style={[styles.actionText, { color: '#FFD700' }]}>Send MASS</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.secondary + '20' }]}
              onPress={() => router.push('/(tabs)/marketplace')}
            >
              <FontAwesome5 name="store" size={20} color={colors.secondary} />
              <Text style={[styles.actionText, { color: colors.secondary }]}>Marketplace</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            <TouchableOpacity onPress={() => router.push('/screens/MassCoinTransactionsScreen')}>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.recentActivity}>
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.success + '20' }]}>
                <Ionicons name="trending-up" size={16} color={colors.success} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>Wallet Created</Text>
                <Text style={[styles.activityTime, { color: colors.lightText }]}>Just now</Text>
              </View>
            </View>
            
            <View style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="gift" size={16} color={colors.primary} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text }]}>Welcome Bonus</Text>
                <Text style={[styles.activityTime, { color: colors.lightText }]}>1,000 MASS received</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  welcomeSection: {
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  walletInfo: {
    gap: 16,
  },
  walletBalance: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balanceUsd: {
    fontSize: 14,
  },
  walletStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  walletStat: {
    alignItems: 'center',
  },
  walletStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  walletStatLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  recentActivity: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
}); 