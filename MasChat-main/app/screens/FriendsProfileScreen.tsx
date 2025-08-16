import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserPosts, unfriend } from '../lib/services/userService';
import { getPosts, Post, likePost, unlikePost } from '../lib/services/postService';
import { fetchReels, Reel } from '../lib/services/reelService';
import { friendService } from '../lib/services/friendService';
import client from '../api/client';
import CommentDialog from "../components/CommentDialog";

// Color Palette
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const DEFAULT_COVER = "https://images.unsplash.com/photo-1506744038136-46273834b3fb";
const DEFAULT_AVATAR = "https://randomuser.me/api/portraits/men/1.jpg";

const LIKE_ACTIVE_COLOR = '#22c55e'; // Green
const LIKE_INACTIVE_COLOR = COLORS.lightText;

export default function FriendsProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userReels, setUserReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mediaModal, setMediaModal] = useState<{ type: 'photo' | 'video' | 'reel', uri: string, postId?: string, reelId?: string } | null>(null);
  const [isFriend, setIsFriend] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [postId: string]: string[] }>({});
  const [commentModalPost, setCommentModalPost] = useState<Post | null>(null);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ type: 'photo' | 'video', uri: string } | null>(null);
  const [fullscreenVideoPaused, setFullscreenVideoPaused] = useState(false);
  const [fullscreenVideoMuted, setFullscreenVideoMuted] = useState(false);
  const fullscreenVideoRef = React.useRef<any>(null);

  const tabs = ['Posts', 'About', 'Videos', 'Photos'];
  const targetUserId = params.userId as string;

  const fetchProfile = async () => {
    if (!targetUserId) return;
    try {
      setLoading(true);
      const data = await getUserProfile(targetUserId);
      setProfileData(data);
      // Fetch posts and reels for this user
      const posts = await getUserPosts(targetUserId);
      setUserPosts(posts);
      const allReels = await fetchReels();
      setUserReels(allReels.filter((r: Reel) => r.userId === targetUserId));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchFriendStatus = async () => {
    if (!user || !targetUserId) return;
    try {
      // Check friend request status
      const statusRes = await client.get(`/friends/status?senderId=${user.id}&receiverId=${targetUserId}`);
      const status = statusRes.data.status;
      
      setIsFriend(status === 'FRIENDS');
      setRequestSent(status === 'SENT');
      
      // If status is RECEIVED, we should show accept/decline options
      if (status === 'RECEIVED') {
        // Fetch the specific request to get its ID
        const pendingRes = await client.get(`/friends/pending/${user.id}`);
        const receivedRequest = pendingRes.data.find((r: any) => r.sender.id === targetUserId);
        if (receivedRequest) {
          setPendingRequests([receivedRequest]);
        }
      }
    } catch (error) {
      console.error('Error fetching friend status:', error);
    }
  };

  const handleFriendRequest = async () => {
    if (!user?.id || !targetUserId) return;
    
    try {
      await friendService.sendFriendRequest(user.id, targetUserId);
      setRequestSent(true);
      Alert.alert('Success', 'Friend request sent!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleAcceptFriendRequest = async (requestId: string) => {
    try {
      await client.post(`/friends/accept/${requestId}`);
      setIsFriend(true);
      setPendingRequests([]);
      Alert.alert('Success', 'Friend request accepted!');
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request. Please try again.');
    }
  };

  const handleDeclineFriendRequest = async (requestId: string) => {
    try {
      await client.delete(`/friends/request/${requestId}`);
      setPendingRequests([]);
      Alert.alert('Success', 'Friend request declined.');
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request. Please try again.');
    }
  };

  const handleCancelFriendRequest = async () => {
    if (!user?.id || !targetUserId) return;
    try {
      await friendService.cancelFriendRequest(user.id, targetUserId);
      setRequestSent(false);
      Alert.alert('Success', 'Friend request cancelled.');
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      Alert.alert('Error', 'Failed to cancel friend request. Please try again.');
    }
  };

  const handleStartChat = () => {
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(profileData) }
    });
  };

  const handleLikePost = async (post: Post) => {
    if (!user?.id) return;
    const alreadyLiked = (optimisticLikes[post.id] || post.likedBy || []).includes(user?.id || '');
    // Optimistic UI update
    setOptimisticLikes(prev => ({
      ...prev,
      [post.id]: alreadyLiked
        ? (prev[post.id] || post.likedBy || []).filter(id => id !== user?.id || '')
        : [...(prev[post.id] || post.likedBy || []), user?.id || '']
    }));
    // Backend update
    if (alreadyLiked) {
      await unlikePost(post.id, user?.id || '');
    } else {
      await likePost(post.id, user?.id || '');
    }
    fetchProfile();
  };

  const handleUnfriend = async () => {
    if (!user?.id || !targetUserId) return;
    Alert.alert('Unfriend', 'Are you sure you want to remove this friend?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Unfriend', style: 'destructive', onPress: async () => {
        await unfriend(user.id, targetUserId);
        setIsFriend(false);
        fetchProfile();
      }}
    ]);
  };

  useEffect(() => { fetchProfile(); fetchFriendStatus(); }, [targetUserId, user?.id]);

  if (!targetUserId) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>User not found</Text>
      </View>
    );
  }

  if (loading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchProfile();
            }}
            colors={[COLORS.primary]}
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {/* Cover Photo */}
        <View style={styles.coverContainer}>
          <Image
            source={{ uri: profileData.coverPhoto || DEFAULT_COVER }}
            style={styles.coverPhoto}
          />
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('../screens/SearchScreen')}
            >
              <Ionicons name="search" size={20} color="white" />
            </TouchableOpacity>
          </View> 
        </View>

        {/* Profile Picture */}
        <View style={styles.profilePicContainer}>
          <View style={styles.orangeRing}>
            <Image
              source={{ uri: profileData.profilePicture || DEFAULT_AVATAR }}
              style={styles.profilePic}
            />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {profileData.fullName || 'User'}
            {profileData.verified && (
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={styles.verifiedBadge} />
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
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24 }}>No posts yet.</Text>
              ) : (
                userPosts.map(post => (
                  <View key={post.id} style={{ backgroundColor: COLORS.white, marginBottom: 16, padding: 16, borderRadius: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <TouchableOpacity onPress={() => router.push({ pathname: '../screens/FriendsProfileScreen', params: { userId: post.user.id } })}>
                        <Image 
                          source={{ uri: post.user.profilePicture || DEFAULT_AVATAR }} 
                          style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }} 
                        />
                      </TouchableOpacity>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold' }}>{post.user.username}</Text>
                        <Text style={{ color: COLORS.lightText, fontSize: 12 }}>{post.createdAt}</Text>
                      </View>
                    </View>
                    <Text style={{ color: COLORS.text }}>{post.content}</Text>
                    {post.imageUrl && <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 200, borderRadius: 8, marginTop: 8 }} />}
                    {post.videoUrl && <Text style={{ color: COLORS.accent, marginTop: 8 }}>[Video attached]</Text>}
                    <View style={styles.postActions}>
                      <TouchableOpacity onPress={() => user && handleLikePost(post)} style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                          <Ionicons
                            name={(optimisticLikes[post.id] || post.likedBy || []).includes(user?.id || '') ? 'heart' : 'heart-outline'}
                            size={22}
                            color={(optimisticLikes[post.id] || post.likedBy || []).includes(user?.id || '') ? LIKE_ACTIVE_COLOR : LIKE_INACTIVE_COLOR}
                          />
                        </View>
                        <Text style={styles.actionText}>Like</Text>
                        <Text style={styles.actionCount}>{(optimisticLikes[post.id] || post.likedBy || []).length}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => setCommentModalPost(post)} style={styles.actionBtn}>
                        <View style={styles.actionIcon}>
                          <Ionicons name="chatbubble" size={18} color={COLORS.primary} />
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
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {userPosts.filter(p => p.imageUrl).length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24, width: '100%' }}>No photos yet.</Text>
              ) : (
                userPosts.filter(p => p.imageUrl).map(post => (
                  <TouchableOpacity key={post.id} onPress={() => setMediaModal({ type: 'photo', uri: post.imageUrl!, postId: post.id })}>
                    <Image source={{ uri: post.imageUrl! }} style={{ width: '48%', height: 160, borderRadius: 8, marginBottom: 8 }} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
          {activeTab === 'Videos' && (
            <View style={{ width: '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-start' }}>
              {userPosts.filter(p => p.videoUrl).length + userReels.length === 0 ? (
                <Text style={{ textAlign: 'center', color: COLORS.lightText, marginVertical: 24, width: '100%' }}>No videos yet.</Text>
              ) : (
                <>
                  {userPosts.filter(p => p.videoUrl).map(post => (
                    <TouchableOpacity key={post.id} onPress={() => setMediaModal({ type: 'video', uri: post.videoUrl!, postId: post.id })}>
                      <View style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="videocam" size={40} color={COLORS.accent} />
                        <Text style={{ color: COLORS.text, fontSize: 13, marginTop: 8 }}>[Post Video]</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {userReels.map(reel => (
                    <TouchableOpacity key={reel.id} onPress={() => setMediaModal({ type: 'reel', uri: reel.mediaUrl, reelId: reel.id })}>
                      <View style={{ width: '48%', height: 160, backgroundColor: '#eee', borderRadius: 8, marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
                        <Ionicons name="film" size={40} color={COLORS.primary} />
                        <Text style={{ color: COLORS.text, fontSize: 13, marginTop: 8 }}>[Reel]</Text>
                      </View>
                    </TouchableOpacity>
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
                      <Ionicons name="briefcase" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>Works at {profileData.details.worksAt1}</Text>
                  </View>
                )}
                
                {profileData.details?.studiedAt && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="school" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>Studied at {profileData.details.studiedAt}</Text>
                  </View>
                )}
                
                {profileData.details?.currentCity && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="location" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>Lives in {profileData.details.currentCity}</Text>
                  </View>
                )}
                
                {profileData.details?.hometown && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="home" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>From {profileData.details.hometown}</Text>
                  </View>
                )}
                
                {profileData.details?.relationshipStatus && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="heart" size={18} color={COLORS.primary} />
                    </View>
                    <Text style={styles.detailText}>{profileData.details.relationshipStatus}</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
        {user && !isFriend && !requestSent && user.id !== targetUserId && (
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#22c55e', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleFriendRequest}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Add Friend</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleStartChat}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
        {requestSent && (
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
            <View style={{ flex: 1, backgroundColor: '#fbbf24', padding: 12, borderRadius: 8, alignItems: 'center' }}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Request Sent</Text>
            </View>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#ff4444', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={handleCancelFriendRequest}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        {pendingRequests.length > 0 && pendingRequests.some((r: any) => r.sender.id === targetUserId) && (
          <View style={{ flexDirection: 'row', gap: 12, marginVertical: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#22c55e', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => handleAcceptFriendRequest(pendingRequests.find((r: any) => r.sender.id === targetUserId)?.id || '')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Accept Request</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#ff4444', padding: 12, borderRadius: 8, alignItems: 'center' }}
              onPress={() => handleDeclineFriendRequest(pendingRequests.find((r: any) => r.sender.id === targetUserId)?.id || '')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}
        {isFriend && (
          <TouchableOpacity
            style={{ backgroundColor: COLORS.primary, padding: 12, borderRadius: 8, marginVertical: 12, alignItems: 'center' }}
            onPress={handleStartChat}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Message Friend</Text>
          </TouchableOpacity>
        )}
        {isFriend && (
          <TouchableOpacity
            style={{ backgroundColor: '#ff4444', padding: 12, borderRadius: 8, marginVertical: 12, alignItems: 'center' }}
            onPress={handleUnfriend}
          >
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Unfriend</Text>
          </TouchableOpacity>
        )}
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
                <Ionicons name="play-circle" size={80} color={COLORS.accent} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view video</Text>
              </TouchableOpacity>
            )}
            {mediaModal.type === 'reel' && (
              <TouchableOpacity onPress={() => { setMediaModal(null); router.push({ pathname: '/screens/ReelViewerScreen', params: { reelId: mediaModal.reelId } }); }}>
                <Ionicons name="play-circle" size={80} color={COLORS.primary} />
                <Text style={{ color: '#fff', marginTop: 16 }}>Tap to view reel</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
      {commentModalPost && user?.id && (
        <CommentDialog
          postId={commentModalPost.id}
          userId={user.id}
          onClose={() => setCommentModalPost(null)}
          onComment={fetchProfile}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  coverContainer: {
    height: 200,
    backgroundColor: '#E0E0E0',
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
    borderColor: COLORS.accent,
    borderRadius: 64,
    padding: 0,
  },
  profilePic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: COLORS.lightText,
    marginBottom: 8,
    fontWeight: '500',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  stats: {
    color: COLORS.lightText,
    marginBottom: 12,
  },
  bio: {
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: '#e7f0fd',
  },
  tabText: {
    fontSize: 16,
    color: COLORS.lightText,
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  detailsContainer: {
    width: '100%',
    marginTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e7f0fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: {
    color: COLORS.text,
    fontSize: 16,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.lightText,
    borderRadius: 8,
  },
  actionIcon: {
    marginRight: 8,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  actionCount: {
    fontSize: 14,
    color: COLORS.lightText,
  },
}); 