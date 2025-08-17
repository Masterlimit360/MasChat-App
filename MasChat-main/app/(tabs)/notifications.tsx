import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Animated,
  Dimensions,
  Alert,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchNotifications, markNotificationRead, markMultipleNotificationsRead, markAllNotificationsRead, deleteMultipleNotifications, Notification, acceptFriendRequest, deleteFriendRequest, deleteNotification } from '../lib/services/userService';
import client from '../api/client';
import { getWebSocketUrl } from '../api/client';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Swipeable } from 'react-native-gesture-handler';
import { useNotification } from '../context/NotificationContext';
import ModernHeader from '../../components/ModernHeader';
import notificationService from '../lib/services/notificationService';

// Modern Color Palette
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

const DEVICE_WIDTH = Dimensions.get('window').width;

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function Notifications() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  const currentColors = colors;
  const styles = getStyles(currentColors, currentTheme);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { user } = useAuth();
  const { showBanner } = useNotification();
  const [refreshing, setRefreshing] = React.useState(false);
  const pulseAnimation = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetchNotifications(user.id)
      .then(data => setNotifications(data))
      .finally(() => setLoading(false));

    // WebSocket for real-time notifications
    const socket = new SockJS(getWebSocketUrl());
    const client = new Client({
      webSocketFactory: () => socket,
      debug: str => console.log(str),
      onConnect: () => {
        console.log('WebSocket connected successfully');
        client.subscribe(`/user/${user.id}/queue/notifications`, message => {
          const notificationData = JSON.parse(message.body);
          console.log('Received notification update:', notificationData);
          
          switch (notificationData.type) {
            case 'NEW_NOTIFICATION':
              const newNotification = {
                id: notificationData.id?.toString() || `${Date.now()}`,
                message: notificationData.message,
                read: false,
                createdAt: notificationData.createdAt || new Date().toISOString(),
              };
              setNotifications(prev => [newNotification, ...prev]);
              
              // Show device notification
              notificationService.scheduleLocalNotification({
                id: newNotification.id,
                title: notificationData.title || 'New Notification',
                body: notificationData.message,
                data: { notificationId: newNotification.id }
              });
              
              // Show banner for new notifications
              showBanner(notificationData.message);
              break;
              
            case 'NOTIFICATION_READ':
              setNotifications(prev => prev.map(n => 
                n.id === notificationData.id?.toString() 
                  ? { ...n, read: true } 
                  : n
              ));
              break;
              
            case 'BULK_NOTIFICATIONS_READ':
              setNotifications(prev => prev.map(n => 
                notificationData.notificationIds?.includes(parseInt(n.id))
                  ? { ...n, read: true }
                  : n
              ));
              break;
              
            case 'ALL_NOTIFICATIONS_READ':
              setNotifications(prev => prev.map(n => ({ ...n, read: true })));
              break;
              
            case 'NOTIFICATION_DELETED':
              setNotifications(prev => prev.filter(n => n.id !== notificationData.id?.toString()));
              break;
              
            case 'BULK_NOTIFICATIONS_DELETED':
              setNotifications(prev => prev.filter(n => 
                !notificationData.notificationIds?.includes(parseInt(n.id))
              ));
              break;
          }
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket STOMP error:', frame);
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error:', error);
      },
      onWebSocketClose: (event) => {
        console.log('WebSocket closed:', event);
      }
    });
    client.activate();
    return () => { client.deactivate(); };
  }, [user?.id]);

  // Initialize device notifications
  React.useEffect(() => {
    notificationService.registerForPushNotificationsAsync();
    
    // Listen for notification responses (when user taps notification)
    const responseListener = notificationService.addNotificationResponseReceivedListener(response => {
      const notificationId = response.notification.request.content.data?.notificationId as string;
      if (notificationId) {
        handleMarkRead(notificationId);
      }
    });

    return () => {
      responseListener?.remove();
    };
  }, []);

  // Pulse animation for unread notifications
  React.useEffect(() => {
    const hasUnread = notifications.some(n => !n.read);
    if (hasUnread) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [notifications, pulseAnimation]);

  const handleMarkRead = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read: true } : n));
  };

  const handleConfirmFriendRequest = async (requestId: string) => {
    try {
      console.log('Accepting friend request:', requestId);
      await acceptFriendRequest(requestId);
      setNotifications(prev => prev.map(n =>
        n.id === requestId ? { ...n, read: true, message: 'Friend request accepted.' } : n
      ));
      console.log('Friend request accepted successfully');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleDeleteFriendRequest = async (requestId: string) => {
    try {
      console.log('Declining friend request:', requestId);
      await deleteFriendRequest(requestId);
      setNotifications(prev => prev.filter(n => n.id !== requestId));
      console.log('Friend request declined successfully');
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const renderRightActions = (notificationId: string) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', width: 120 }}>
      <TouchableOpacity 
        style={{ backgroundColor: colors.accent, justifyContent: 'center', alignItems: 'center', width: 60, height: '100%' }}
        onPress={() => handleMarkRead(notificationId)}
      >
        <Ionicons name="checkmark" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity 
        style={{ backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center', width: 60, height: '100%' }}
        onPress={async () => {
          await handleDeleteNotification(notificationId);
        }}
      >
        <Ionicons name="trash" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Custom Header with Search Button */}
      <BlurView
        intensity={80}
        tint={currentTheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: colors.tabBarBg, borderBottomColor: colors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => router.push('/screens/SearchScreen')}>
            <Ionicons name="search" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Notifications Title & Mark All as Read */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.filter(n => !n.read).length}</Text>
            <Text style={styles.statLabel}>Unread</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
        {notifications.some(n => !n.read) && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markAllBtn}>
            <LinearGradient
              colors={[colors.accent, '#FF6B35']}
              style={styles.markAllGradient}
            >
              <Ionicons name="checkmark-done" size={16} color="white" />
              <Text style={[styles.markAllText, { color: colors.card }]}>Mark all read</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={async () => {
            setRefreshing(true);
            if (user?.id) {
              const data = await fetchNotifications(user.id);
              setNotifications(data);
            }
            setRefreshing(false);
          }} />
        }
      >
        <Text style={styles.sectionLabel}>New</Text>
        {loading ? (
          <View style={{ padding: 24 }}>
            {[...Array(4)].map((_, i) => (
              <View key={i} style={[
                styles.card, 
                { 
                  opacity: 0.6, 
                  backgroundColor: currentTheme === 'dark' ? '#3A3A4E' : '#F0F0F0',
                  marginBottom: 16,
                  height: 80,
                  borderRadius: 16,
                  shadowOpacity: 0.05,
                }
              ]} />
            ))}
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.emptyIconContainer}
            >
              <Ionicons name="notifications-off" size={48} color="white" />
            </LinearGradient>
            <Text style={[styles.emptyTitle, { color: currentColors.text }]}>No notifications yet</Text>
            <Text style={[styles.emptySubtitle, { color: currentColors.lightText }]}>
              When you receive notifications, they'll appear here
            </Text>
          </View>
        ) : notifications.map((item) => (
          <Swipeable
            key={item.id}
            renderRightActions={() => renderRightActions(item.id)}
            overshootRight={false}
          >
            <Animated.View style={[
              styles.card,
              !item.read && styles.unreadCard,
              { 
                borderLeftWidth: 4, 
                borderLeftColor: !item.read ? colors.accent : 'transparent',
                transform: !item.read ? [{ scale: pulseAnimation }] : []
              }
            ]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => handleMarkRead(item.id)}>
                <View style={styles.row}>
                  <View style={[styles.avatarContainer, !item.read && styles.unreadAvatar]}>
                    {/* Use icon based on notification type */}
                    {item.avatar ? (
                      <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : item.message?.toLowerCase().includes('friend request') ? (
                      <LinearGradient
                        colors={[colors.primary, colors.secondary]}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="person-add" size={20} color="white" />
                      </LinearGradient>
                    ) : item.message?.toLowerCase().includes('like') ? (
                      <LinearGradient
                        colors={[colors.danger, '#FF6B6B']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="heart" size={20} color="white" />
                      </LinearGradient>
                    ) : item.message?.toLowerCase().includes('comment') ? (
                      <LinearGradient
                        colors={[colors.accent, '#FF6B35']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="chatbubble" size={20} color="white" />
                      </LinearGradient>
                    ) : item.message?.toLowerCase().includes('masscoin') || item.message?.toLowerCase().includes('token') ? (
                      <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="diamond" size={20} color="white" />
                      </LinearGradient>
                    ) : (
                      <LinearGradient
                        colors={[colors.success, '#4CC9F0']}
                        style={styles.iconGradient}
                      >
                        <Ionicons name="notifications" size={20} color="white" />
                      </LinearGradient>
                    )}
                  </View>
                  <View style={styles.notificationContent}>
                    <Text style={[
                      styles.messageText, 
                      !item.read && styles.bold,
                      { color: currentTheme === 'dark' ? '#000000' : '#1A1A1A' }
                    ]}>
                      {item.message}
                    </Text>
                    <Text style={[
                      styles.time,
                      { color: currentTheme === 'dark' ? '#B0B0B0' : '#666666' }
                    ]}>
                      {formatTimeAgo(new Date(item.createdAt))}
                    </Text>
                    {/* Friend request actions */}
                    {item.message?.toLowerCase().includes('friend request') && !item.read && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirmFriendRequest(item.id)}>
                          <LinearGradient
                            colors={[colors.success, '#4CC9F0']}
                            style={styles.actionGradient}
                          >
                            <Ionicons name="checkmark" size={16} color="white" />
                            <Text style={styles.actionText}>Accept</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.declineBtn} onPress={() => handleDeleteFriendRequest(item.id)}>
                          <LinearGradient
                            colors={[colors.danger, '#FF6B6B']}
                            style={styles.actionGradient}
                          >
                            <Ionicons name="close" size={16} color="white" />
                            <Text style={styles.actionText}>Decline</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  {!item.read && (
                    <View style={styles.unreadDot}>
                      <LinearGradient
                        colors={[colors.accent, '#FF6B35']}
                        style={styles.dotGradient}
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          </Swipeable>
        ))}
      </ScrollView>
    </View>
  );
}

const getStyles = (currentColors: any, currentTheme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: currentColors.card,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
  },
  notificationsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: currentColors.text,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: currentColors.text,
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    backgroundColor: currentColors.card,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: currentColors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: currentColors.background,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  messageText: {
    fontSize: 15,
    color: currentColors.text,
    marginBottom: 4,
    lineHeight: 20,
    fontWeight: '500',
  },
  bold: {
    fontWeight: "700",
    color: currentColors.text,
  },
  mutual: {
    fontSize: 13,
    color: currentColors.lightText,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: currentColors.lightText,
    marginTop: 4,
    fontWeight: '400',
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 8
  },
  actionBtn: {
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  primaryAction: {
    backgroundColor: currentColors.primary,
  },
  secondaryAction: {
    backgroundColor: currentColors.background,
  },
  actionText: {
    fontSize: 15,
    fontWeight: "bold",
  },
  primaryText: {
    color: currentColors.white,
  },
  secondaryText: {
    color: currentColors.text,
  },
  markAllBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
  },
  markAllText: {
    color: currentColors.white,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 4,
  },
  unreadCard: {
    shadowColor: currentColors.accent,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: currentColors.theme === 'dark' ? '#2A2A3E' : '#FFF8F0',
    borderColor: currentColors.accent,
    borderWidth: 1.5,
    transform: [{ scale: 1.02 }],
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: currentColors.card,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: currentColors.background,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: currentColors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: currentColors.lightText,
    marginTop: 4,
    fontWeight: '500',
  },
  markAllGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  unreadAvatar: {
    backgroundColor: currentColors.theme === 'dark' ? '#3A3A4E' : '#FFF0E0',
    borderWidth: 2,
    borderColor: currentColors.accent,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationContent: {
    flex: 1,
    paddingRight: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  declineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
    shadowColor: currentColors.accent,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  dotGradient: {
    flex: 1,
    borderRadius: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    opacity: 0.8,
  },
});