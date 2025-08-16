import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile, getUserFriends, getUserPosts, Friend } from '../lib/services/userService';
import { getPosts, Post, likePost, unlikePost } from '../lib/services/postService';
import { fetchReels, Reel } from '../lib/services/reelService';
import CommentDialog from "../components/CommentDialog";
import { useFocusEffect } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import client from '../api/client';
import ModernHeader from '../../components/ModernHeader';
import MassCoinBalance from '../../components/MassCoinBalance';

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

const DEFAULT_COVER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";
const DEFAULT_PROFILE_PHOTO = "https://randomuser.me/api/portraits/men/1.jpg";

const LIKE_ACTIVE_COLOR = '#22c55e'; // Green
const LIKE_INACTIVE_COLOR = COLORS.light.lightText;

export default function Profile() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  const currentColors = colors;
  const styles = getStyles(currentColors);
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [userFriends, setUserFriends] = useState<Friend[]>([]);
  const [mediaModal, setMediaModal] = useState<{ type: 'photo' | 'video' | 'reel', uri: string, postId?: string, reelId?: string } | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [postId: string]: string[] }>({});
  const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ type: 'photo' | 'video', uri: string } | null>(null);
  const [fullscreenVideoPaused, setFullscreenVideoPaused] = useState(false);
  const [fullscreenVideoMuted, setFullscreenVideoMuted] = useState(false);
  const fullscreenVideoRef = React.useRef<any>(null);
  const [videoLoading, setVideoLoading] = useState<{ [key: string]: boolean }>({});

  const tabs = ['Posts', 'About', 'Videos', 'Photos'];

  const fetchProfileData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [profile, posts, reels, friends] = await Promise.all([
        getUserProfile(user.id),
        getUserPosts(user.id),
        fetchReels(),
        getUserFriends(user.id)
      ]);
      
      setProfileData(profile);
      setUserPosts(posts);
      setUserReels(reels.filter((r: Reel) => r.userId === user.id));
      setUserFriends(friends);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh on focus to show new posts
  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData();
    }, [user?.id])
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Please sign in to view profile</Text>
      </View>
    );
  }

  if (loading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.light.primary} />
      </View>
    );
  }

  // Helper function to format post time (assuming a simple date parsing)
  const formatPostTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  };

  // Helper function to navigate to appropriate profile screen
  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push({ pathname: '../screens/FriendsProfileScreen', params: { userId } });
    }
  };

  const handleLikePost = async (post: Post) => {
    if (!user) return;
    const alreadyLiked = (optimisticLikes[post.id] || post.likedBy || []).includes(user.id);
    // Optimistic UI update
    setOptimisticLikes(prev => ({
      ...prev,
      [post.id]: alreadyLiked
        ? (prev[post.id] || post.likedBy || []).filter(id => id !== user.id)
        : [...(prev[post.id] || post.likedBy || []), user.id]
    }));
    // Backend update
    try {
      if (alreadyLiked) {
        const response = await unlikePost(post.id, user.id);
        // Update the post with the response from server
        setUserPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id 
              ? { ...p, likedBy: response.likedBy || [], likeCount: response.likeCount || 0 }
              : p
          )
        );
      } else {
        const response = await likePost(post.id, user.id);
        // Update the post with the response from server
        setUserPosts(prevPosts => 
          prevPosts.map(p => 
            p.id === post.id 
              ? { ...p, likedBy: response.likedBy || [], likeCount: response.likeCount || 0 }
              : p
          )
        );
      }
      
      // Clear optimistic update after successful server response
      setOptimisticLikes(prev => {
        const newState = { ...prev };
        delete newState[post.id];
        return newState;
      });
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticLikes(prev => ({
        ...prev,
        [post.id]: alreadyLiked
          ? [...(prev[post.id] || post.likedBy || []), user.id]
          : (prev[post.id] || post.likedBy || []).filter(id => id !== user.id)
      }));
      console.error('Like error:', error);
    }
  };

  const uniqueFriends = Array.from(new Map(userFriends.map(f => [f.id, f])).values());

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfileData();
            }}
            colors={[COLORS.light.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Cover Photo (add onPress for fullscreen) */}
        <View style={styles.coverContainer}>
          <TouchableOpacity onPress={() => setFullscreenMedia({ type: 'photo', uri: profileData.coverPhoto || DEFAULT_COVER || '' })}>
            <Image
              source={{ uri: profileData.coverPhoto || DEFAULT_COVER || '' }}
              style={styles.coverPhoto}
            />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <MassCoinBalance size="small" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }} />
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/editProfile")}
            >
              <Ionicons name="pencil-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/SettingsScreen")}
            >
              <Ionicons name="settings" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push("../screens/SearchScreen")}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View> 
        </View>

        {/* Profile Picture (add onPress for fullscreen) */}
        <View style={styles.profilePicContainer}>
          <TouchableOpacity onPress={() => setFullscreenMedia({ type: 'photo', uri: profileData.profilePicture || DEFAULT_AVATAR || '' })}>
            <View style={styles.orangeRing}>
              <Image
                source={{ uri: profileData.profilePicture || DEFAULT_AVATAR || '' }}
                style={styles.profilePic}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.cameraButton}
            onPress={() => router.push("../screens/editProfile")}
          >
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>   
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData.fullName || 'User'}
            {profileData.verified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.light.primary} style={styles.verifiedBadge} />
            )}
          </Text>
          
          {/* Username beneath full name */}
          {profileData.username && profileData.fullName && (
            <Text style={styles.username}>
              @{profileData.username}
            </Text>
          )}
          
          <Text style={styles.stats}>
            {profileData.details?.followerCount || 0} followers · {profileData.details?.followingCount || 0} following
          </Text>

          {profileData.bio && (
            <Text style={styles.bio}>{profileData.bio}</Text>
          )}

          {/* Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
          >
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabButton,
                  activeTab === tab && styles.activeTabButton
                ]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tabs content */}
          {activeTab === 'Posts' && (
            <View style={{ width: '100%' }}>
              {userPosts.length === 0 ? (
                <Text style={{ textAlign: 'center', color: currentColors.lightText, marginVertical: 24 }}>No posts yet.</Text>
              ) : (
                userPosts.map(post => (
                  <View key={post.id} style={{ backgroundColor: currentColors.card, marginBottom: 16, padding: 16, borderRadius: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => navigateToProfile(post.user.id)}>
                        <Image 
                          source={{ uri: post.user.profilePicture || DEFAULT_PROFILE_PHOTO || '' }} 
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} 
                        />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: currentColors.text }}>{post.user.username}</Text>
                        <Text style={{ color: currentColors.lightText, fontSize: 12 }}>{formatPostTime(post.createdAt)}</Text>
                      </View>
                    </View>
                    <Text style={{ color: currentColors.text }}>{post.content}</Text>
                    {post.imageUrl && (
                      <TouchableOpacity onPress={() => setFullscreenMedia({ type: 'photo', uri: post.imageUrl || '' })}>
                        <Image source={{ uri: post.imageUrl || '' }} style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }} />
                      </TouchableOpacity>
                    )}
                    {post.videoUrl && (
                      <View style={{ width: '100%', height: 220, marginTop: 8, borderRadius: 8, overflow: 'hidden', backgroundColor: '#000' }}>
                        <TouchableOpacity
                          activeOpacity={1}
                          onPress={() => setPlayingVideoId(post.id)}
                          style={{ width: '100%', height: '100%' }}
                        >
                          {videoLoading[post.id] && (
                            <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
                          )}
                          {post.videoUrl ? (
                            <Video
                              source={{ uri: post.videoUrl || '' }}
                              style={{ width: '100%', height: 220 }}
                              resizeMode={ResizeMode.COVER}
                              shouldPlay={playingVideoId === post.id}
                              isLooping
                              isMuted={true}
                              onLoadStart={() => setVideoLoading(v => ({ ...v, [post.id]: true }))}
                              onReadyForDisplay={() => setVideoLoading(v => ({ ...v, [post.id]: false }))}
                              onError={e => {
                                setVideoLoading(v => ({ ...v, [post.id]: false }));
                                // Silently handle video errors - they're common and not critical
                              }}
                            />
                          ) : (
                            <Text style={{ color: '#fff', textAlign: 'center', marginTop: 40 }}>Video unavailable</Text>
                          )}
                          {/* Play/Pause button overlay */}
                          <TouchableOpacity
                            style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }], zIndex: 2 }}
                            onPress={e => {
                              e.stopPropagation();
                              setPlayingVideoId(playingVideoId === post.id ? null : post.id);
                            }}
                          >
                            <Ionicons name={playingVideoId === post.id ? 'pause-circle' : 'play-circle'} size={48} color="#fff" />
                          </TouchableOpacity>
                          {/* Expand button for fullscreen */}
                          <TouchableOpacity
                            style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                            onPress={e => {
                              e.stopPropagation();
                              setFullscreenMedia({ type: 'video', uri: post.videoUrl || '' });
                            }}
                          >
                            <Ionicons name="expand" size={28} color="#fff" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      </View>
                    )}
                    <View style={styles.postActions}>
                      <TouchableOpacity onPress={() => user && handleLikePost(post)} style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                          <Ionicons
                            name={(optimisticLikes[post.id] || post.likedBy || []).includes(user.id) ? 'heart' : 'heart-outline'}
                            size={22}
                            color={(optimisticLikes[post.id] || post.likedBy || []).includes(user.id) ? LIKE_ACTIVE_COLOR : LIKE_INACTIVE_COLOR}
                          />
                        </View>
                        <Text style={styles.actionText}>Like</Text>
                        <Text style={styles.actionCount}>{(optimisticLikes[post.id] || post.likedBy || []).length}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setCommentModalPost(post)} style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                          <Ionicons name="chatbubble" size={18} color={COLORS.light.primary} />
                        </View>
                        <Text style={styles.actionText}>Comment</Text>
                        <Text style={styles.actionCount}>{post.comments?.length || 0}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
          {activeTab === 'Photos' && (
            <View style={{ width: '100%' }}>
              {/* Profile Pictures Section */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.light.text, marginBottom: 12 }}>Profile Pictures</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {profileData.profilePicture && (
                    <TouchableOpacity onPress={() => setMediaModal({ type: 'photo', uri: profileData.profilePicture || '' })}>
                      <Image source={{ uri: profileData.profilePicture || '' }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Cover Photos Section */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.light.text, marginBottom: 12 }}>Cover Photos</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {profileData.coverPhoto && (
                    <TouchableOpacity onPress={() => setMediaModal({ type: 'photo', uri: profileData.coverPhoto || '' })}>
                      <Image source={{ uri: profileData.coverPhoto || '' }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Posted Photos Section */}
              <View>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.light.text, marginBottom: 12 }}>Posted Photos</Text>
                {userPosts.filter(p => p.imageUrl).length === 0 ? (
                  <Text style={{ textAlign: 'center', color: COLORS.light.lightText, marginVertical: 12 }}>No photos posted yet.</Text>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {userPosts.filter(p => p.imageUrl).map(post => (
                      <TouchableOpacity key={post.id} onPress={() => setMediaModal({ type: 'photo', uri: post.imageUrl!, postId: post.id })}>
                        <Image source={{ uri: post.imageUrl! || '' }} style={{ width: '48%', height: 160, borderRadius: 8, marginBottom: 8 }} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}
          {activeTab === 'Videos' && (
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {userPosts.filter(p => p.videoUrl).length + userReels.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.light.lightText, marginVertical: 24, width: '100%' }}>No videos yet.</Text>
              ) : (
                <>
                  {userPosts.filter(p => p.videoUrl).map(post => (
                    <View key={post.id} style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setPlayingVideoId(post.id)}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Video
                          source={{ uri: post.videoUrl || '' }}
                          style={{ width: '100%', height: 160 }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={playingVideoId === post.id}
                          isLooping
                          isMuted={false}
                          onError={e => {
                            // Silently handle video errors - they're common and not critical
                          }}
                        />
                        {/* Play/Pause button overlay */}
                        <TouchableOpacity
                          style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }], zIndex: 2 }}
                          onPress={e => {
                            e.stopPropagation();
                            setPlayingVideoId(playingVideoId === post.id ? null : post.id);
                          }}
                        >
                          <Ionicons name={playingVideoId === post.id ? 'pause-circle' : 'play-circle'} size={48} color="#fff" />
                        </TouchableOpacity>
                        {/* Expand button for fullscreen */}
                        <TouchableOpacity
                          style={{ position: 'absolute', top: 10, right: 10, zIndex: 2 }}
                          onPress={e => {
                            e.stopPropagation();
                            setFullscreenMedia({ type: 'video', uri: post.videoUrl || '' });
                          }}
                        >
                          <Ionicons name="expand" size={28} color="#fff" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    </View>
                  ))}
                  {userReels.map(reel => (
                    <View key={reel.id} style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                      <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => setFullscreenMedia({ type: 'video', uri: reel.mediaUrl || '' })}
                        style={{ width: '100%', height: '100%' }}
                      >
                        <Video
                          source={{ uri: reel.mediaUrl || '' }}
                          style={{ width: '100%', height: 160 }}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={false}
                          isLooping
                          isMuted={true}
                          onError={e => {
                            // Silently handle video errors - they're common and not critical
                          }}
                        />
                        {/* Play button overlay for reels */}
                        <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -24 }, { translateY: -24 }], zIndex: 2 }}>
                          <Ionicons name={'play-circle'} size={48} color="#fff" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </>
              )}
            </View>
          )}
          {activeTab === 'About' && (
            <View style={{ width: '100%' }}>
              {/* User Details */}
              <View style={styles.detailsContainer}>
                {profileData.details?.worksAt1 && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="briefcase" size={18} color={COLORS.light.primary} />
                    </View>
                    <Text style={styles.detailText}>Works at {profileData.details.worksAt1}</Text>
                  </View>
                )}
                
                {profileData.details?.studiedAt && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="school" size={18} color={COLORS.light.primary} />
                    </View>
                    <Text style={styles.detailText}>Studied at {profileData.details.studiedAt}</Text>
                  </View>
                )}
                
                {profileData.details?.currentCity && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="location" size={18} color={COLORS.light.primary} />
                    </View>
                    <Text style={styles.detailText}>Lives in {profileData.details.currentCity}</Text>
                  </View>
                )}
                
                {profileData.details?.hometown && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="home" size={18} color={COLORS.light.primary} />
                    </View>
                    <Text style={styles.detailText}>From {profileData.details.hometown}</Text>
                  </View>
                )}
                
                {profileData.details?.relationshipStatus && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="heart" size={18} color={COLORS.light.primary} />
                    </View>
                    <Text style={styles.detailText}>{profileData.details.relationshipStatus}</Text>
                  </View>
                )}
              </View>
              
              {/* Friends Section */}
              <View style={{ marginTop: 24 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: currentColors.text, marginBottom: 16 }}>Friends</Text>
                {uniqueFriends.length === 0 ? (
                  <Text style={{ textAlign: 'center', color: currentColors.lightText, marginVertical: 12 }}>No friends yet.</Text>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                    {uniqueFriends.map(friend => (
                      <TouchableOpacity 
                        key={friend.id} 
                        style={styles.friendItem} 
                        onPress={() => navigateToProfile(friend.id)}
                      >
                        <Image 
                          source={{ uri: friend.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' || '' }} 
                          style={styles.friendAvatar} 
                        />
                        <Text style={styles.friendName}>{friend.fullName || friend.username}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {user?.id === profileData.id && (
                <TouchableOpacity style={{ backgroundColor: '#ff4444', padding: 12, borderRadius: 8, marginVertical: 12, alignItems: 'center' }}
                  onPress={async () => {
                    Alert.alert('Delete Account', 'Are you sure you want to delete your account? This cannot be undone.', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => {
                        await client.delete(`/users/${user.id}`);
                        updateUser(undefined);
                        router.replace('/login');
                      }}
                    ]);
                  }}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Delete Account</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Media Modal */}
      {mediaModal && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setMediaModal(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 24, zIndex: 2 }} onPress={() => setMediaModal(null)}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
            {mediaModal.type === 'photo' && (
              <Image source={{ uri: mediaModal.uri }} style={{ width: 320, height: 320, borderRadius: 12 }} resizeMode="contain" />
            )}
            {mediaModal.type === 'video' && (
              <TouchableOpacity onPress={() => { setMediaModal(null); router.push({ pathname: '/screens/PostViewerScreen', params: { postId: mediaModal.postId } }); }}>
                <Ionicons name="play-circle" size={80} color={COLORS.light.accent} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view video</Text>
              </TouchableOpacity>
            )}
            {mediaModal.type === 'reel' && (
              <TouchableOpacity onPress={() => { setMediaModal(null); router.push({ pathname: '/screens/ReelViewerScreen', params: { reelId: mediaModal.reelId } }); }}>
                <Ionicons name="play-circle" size={80} color={COLORS.light.primary} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view reel</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}

      {/* Media Modal for fullscreen images/videos */}
      {fullscreenMedia && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setFullscreenMedia(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', top: 40, right: 24, zIndex: 2 }} onPress={() => setFullscreenMedia(null)}>
              <Ionicons name="close" size={36} color="#fff" />
            </TouchableOpacity>
            {fullscreenMedia.type === 'photo' && (
              <Image source={{ uri: fullscreenMedia.uri }} style={{ width: 320, height: 320, borderRadius: 12 }} resizeMode="contain" />
            )}
            {fullscreenMedia.type === 'video' && (
              <View style={{ width: '100%', height: 320, justifyContent: 'center', alignItems: 'center' }}>
                <Video
                  ref={fullscreenVideoRef}
                  source={{ uri: fullscreenMedia.uri }}
                  style={{ width: '100%', height: 320 }}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={!fullscreenVideoPaused}
                  isLooping
                  isMuted={fullscreenVideoMuted}
                  useNativeControls={true}
                  onLoadStart={() => setVideoLoading(v => ({ ...v, fullscreen: true }))}
                  onReadyForDisplay={() => setVideoLoading(v => ({ ...v, fullscreen: false }))}
                  onError={e => {
                    setVideoLoading(v => ({ ...v, fullscreen: false }));
                    // Silently handle video errors - they're common and not critical
                  }}
                />
                {videoLoading.fullscreen && (
                  <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
                )}
                {/* Mute button at top left */}
                <TouchableOpacity style={{ position: 'absolute', top: 40, left: 20 }} onPress={() => setFullscreenVideoMuted(m => !m)}>
                  <Ionicons name={fullscreenVideoMuted ? "volume-mute" : "volume-high"} size={36} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}

      {commentModalPost && user?.id && (
        <CommentDialog
          postId={commentModalPost.id}
          userId={user.id}
          onClose={() => setCommentModalPost(null)}
          onComment={fetchProfileData}
        />
      )}
    </View>
  );
}

const getStyles = (currentColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: currentColors.text,
    fontWeight: '500',
  },
  coverContainer: {
    height: 200,
    backgroundColor: currentColors.background,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  headerActions: {
    position: 'absolute',
    top: 50,
    right: 16,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePicContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  orangeRing: {
    borderWidth: 4,
    borderColor: currentColors.accent,
    borderRadius: 64,
    padding: 0,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: currentColors.card,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: currentColors.accent,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: currentColors.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: currentColors.lightText,
    marginBottom: 8,
    fontWeight: '500',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  stats: {
    color: currentColors.lightText,
    marginBottom: 12,
  },
  bio: {
    color: currentColors.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  tabsContainer: {
    paddingBottom: 8,
    marginBottom: 16,
  },
  tabButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#E7F0FD',
  },
  tabText: {
    color: COLORS.light.lightText,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.light.primary,
    fontWeight: 'bold',
  },
  detailsContainer: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.light.card,
    borderRadius: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    color: currentColors.text,
    flex: 1,
  },
  friendItem: {
    alignItems: 'center',
    width: '30%',
  },
  friendAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  friendName: {
    fontSize: 12,
    color: currentColors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.light.lightText,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    color: COLORS.light.text,
    fontWeight: '500',
  },
  actionCount: {
    color: COLORS.light.text,
    fontWeight: 'bold',
  },
});