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
import { groupService, Group, GroupMember, GroupStats } from '../lib/services/groupService';
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



export default function GroupsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState<GroupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover' | 'invites'>('my-groups');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      let groupsData: Group[] = [];
      let statsData: GroupStats | null = null;

      if (activeTab === 'my-groups') {
        groupsData = await groupService.getMyGroups();
      } else if (activeTab === 'discover') {
        groupsData = await groupService.getPublicGroups();
      } else if (activeTab === 'invites') {
        // For now, show empty list for invites
        groupsData = [];
      }

      // Calculate stats based on loaded data
      const myGroups = await groupService.getMyGroups();
      statsData = {
        totalGroups: groupsData.length,
        myGroups: myGroups.length,
        pendingInvites: 2, // Mock data for now
        totalMembers: groupsData.reduce((sum, group) => sum + group.memberCount, 0)
      };

      setGroups(groupsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const joinGroup = async (groupId: string) => {
    try {
      const success = await groupService.joinGroup(groupId);
      if (success) {
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group.id === groupId 
              ? { ...group, isMember: true, memberCount: group.memberCount + 1 }
              : group
          )
        );
        Alert.alert('Success', 'You have joined the group!');
      } else {
        Alert.alert('Error', 'Failed to join the group. Please try again.');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      Alert.alert('Error', 'Failed to join the group. Please try again.');
    }
  };

  const leaveGroup = async (groupId: string) => {
    Alert.alert(
      'Leave Group',
      'Are you sure you want to leave this group?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Leave', 
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await groupService.leaveGroup(groupId);
              if (success) {
                setGroups(prevGroups => 
                  prevGroups.map(group => 
                    group.id === groupId 
                      ? { ...group, isMember: false, memberCount: Math.max(0, group.memberCount - 1) }
                      : group
                  )
                );
                Alert.alert('Success', 'You have left the group.');
              } else {
                Alert.alert('Error', 'Failed to leave the group. Please try again.');
              }
            } catch (error) {
              console.error('Error leaving group:', error);
              Alert.alert('Error', 'Failed to leave the group. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderGroupCard = ({ item }: { item: Group }) => (
    <TouchableOpacity 
      style={[styles.groupCard, { backgroundColor: colors.card }]}
              onPress={() => {
          if (item.isMember) {
            // Navigate to group chat or show group details
            Alert.alert(item.name, `Group: ${item.description}\nMembers: ${item.memberCount}`);
          } else {
            // Show group details
            Alert.alert(item.name, item.description);
          }
        }}
    >
      <View style={styles.groupImageContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.groupImage} />
        {item.isPrivate && (
          <View style={styles.privateBadge}>
            <Ionicons name="lock-closed" size={12} color="white" />
          </View>
        )}
        {item.unreadMessages > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadText}>{item.unreadMessages}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.groupContent}>
        <View style={styles.groupHeader}>
          <Text style={[styles.groupName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.isAdmin && (
            <View style={[styles.adminBadge, { backgroundColor: colors.gold }]}>
              <Text style={styles.adminText}>ADMIN</Text>
            </View>
          )}
        </View>
        
        <Text style={[styles.groupDescription, { color: colors.lightText }]} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={14} color={colors.primary} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.memberCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={14} color={colors.accent} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.lastActivity}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pricetag" size={14} color={colors.success} />
            <Text style={[styles.statText, { color: colors.lightText }]}>{item.category}</Text>
          </View>
        </View>
        
        <View style={styles.membersPreview}>
          {item.members.slice(0, 3).map((member, index) => (
            <View key={member.id} style={[styles.memberAvatar, { marginLeft: index > 0 ? -8 : 0 }]}>
              <Image source={{ uri: member.avatar }} style={styles.avatarImage} />
              {member.isOnline && (
                <View style={[styles.onlineIndicator, { backgroundColor: colors.success }]} />
              )}
            </View>
          ))}
          {item.memberCount > 3 && (
            <Text style={[styles.moreMembers, { color: colors.lightText }]}>
              +{item.memberCount - 3} more
            </Text>
          )}
        </View>
        
        {!item.isMember && (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: colors.primary }]}
            onPress={() => joinGroup(item.id)}
          >
            <Text style={styles.joinButtonText}>Join Group</Text>
          </TouchableOpacity>
        )}
        
        {item.isMember && (
          <TouchableOpacity
            style={[styles.leaveButton, { backgroundColor: colors.border }]}
            onPress={() => leaveGroup(item.id)}
          >
            <Text style={[styles.leaveButtonText, { color: colors.lightText }]}>Leave Group</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Group Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats?.totalGroups || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Groups</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.accent }]}>{stats?.myGroups || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>My Groups</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats?.pendingInvites || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Invites</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.gold }]}>{stats?.totalMembers || 0}</Text>
          <Text style={[styles.statLabel, { color: colors.lightText }]}>Total Members</Text>
        </View>
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsCard, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'my-groups' && styles.activeTab]}
        onPress={() => setActiveTab('my-groups')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'my-groups' ? colors.primary : colors.lightText }]}>
          My Groups
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
        onPress={() => setActiveTab('discover')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'discover' ? colors.primary : colors.lightText }]}>
          Discover
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'invites' && styles.activeTab]}
        onPress={() => setActiveTab('invites')}
      >
        <Text style={[styles.tabText, { color: activeTab === 'invites' ? colors.primary : colors.lightText }]}>
          Invites
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filteredGroups = groups.filter(group => {
    if (activeTab === 'my-groups') return group.isMember;
    if (activeTab === 'discover') return !group.isMember;
    if (activeTab === 'invites') return false; // Would show pending invites
    return true;
  });

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Groups" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading groups...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Groups" showBackButton={true} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {renderStats()}
        {renderTabs()}
        
        <View style={styles.groupsContainer}>
          <View style={styles.headerRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {activeTab === 'my-groups' ? 'My Groups' : activeTab === 'discover' ? 'Discover Groups' : 'Group Invites'}
            </Text>
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={() => Alert.alert('Create Group', 'Create group functionality coming soon!')}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
          
          {filteredGroups.length === 0 ? (
            <View style={styles.emptyState}>
              <FontAwesome name="users" size={64} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>
                {activeTab === 'my-groups' ? 'You haven\'t joined any groups yet' : 
                 activeTab === 'discover' ? 'No groups available to discover' : 'No pending invites'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredGroups}
              renderItem={renderGroupCard}
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
  tabsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
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
  groupsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  headerRow: {
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
  groupCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  groupImageContainer: {
    position: 'relative',
    height: 150,
  },
  groupImage: {
    width: '100%',
    height: '100%',
  },
  privateBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupContent: {
    padding: 16,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  adminBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  adminText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  groupDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  groupStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  membersPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  memberAvatar: {
    position: 'relative',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreMembers: {
    fontSize: 12,
    marginLeft: 8,
  },
  joinButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  leaveButton: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: 14,
    fontWeight: '600',
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