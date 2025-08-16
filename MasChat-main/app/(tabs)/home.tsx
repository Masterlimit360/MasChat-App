import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, Alert, Modal, Dimensions, FlatList, Animated, Share, Easing, ActivityIndicator, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getPosts, likePost, unlikePost, deletePost, Post } from '../lib/services/postService';
import { fetchStories, Story } from '../lib/services/storyService';
import CommentDialog from '../components/CommentDialog';
import MassCoinTipButton from '../../components/MassCoinTipButton';
import MassCoinIcon from '../../components/MassCoinIcon';
import { useFocusEffect } from '@react-navigation/native';


// Modern Color Palette
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
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

const DEFAULT_PROFILE_PHOTO = "https://i.imgur.com/6XbK6bE.jpg";
const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

const LIKE_ACTIVE_COLOR = '#FF3040'; // Red

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  const currentColors = colors;
  const styles = getStyles(currentColors);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [fullscreenMedia, setFullscreenMedia] = useState<{ type: 'image' | 'video', uri: string, id?: string } | null>(null);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [postId: string]: string[] }>({});
  const [showIntroVideo, setShowIntroVideo] = useState(false);
  const [videoKey, setVideoKey] = useState(0);
  const [storyViewerVisible, setStoryViewerVisible] = useState(false);
  const [currentStoryUser, setCurrentStoryUser] = useState<{ userId: string, username: string, profilePicture?: string } | null>(null);
  const [currentUserStories, setCurrentUserStories] = useState<Story[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [videoLoading, setVideoLoading] = useState<{ [key: string]: boolean }>({});
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ postId: string; visible: boolean } | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<{ uri: string; visible: boolean } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string>('');
  const [visibleVideoIds, setVisibleVideoIds] = useState<Set<string>>(new Set());
  const heartAnimation = useRef(new Animated.Value(0)).current;
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<{ postId: string; time: number } | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const videoRefs = useRef<{ [key: string]: any }>({});

  // Group stories by user
  const storiesByUser = stories.reduce((acc, story) => {
    if (!acc[story.userId]) acc[story.userId] = [];
    acc[story.userId].push(story);
    return acc;
  }, {} as { [userId: string]: Story[] });
  
  // Get the latest story for each user
  const getLatestStoryForUser = (userId: string) => {
    const userStories = storiesByUser[userId] || [];
    return userStories.length > 0 ? userStories[userStories.length - 1] : null;
  };
  
  // Generate thumbnail for video stories
  const getStoryThumbnail = (story: Story) => {
    if (story.mediaUrl) {
      // If it's a video, we'll use the mediaUrl as is (it should be a thumbnail)
      // For now, we'll use the mediaUrl directly
      return story.mediaUrl;
    }
    return story.profilePicture || DEFAULT_PROFILE_PHOTO;
  };
  
  const uniqueStoryUsers = Object.values(storiesByUser).map(stories => stories[0]);

  // Check if current user has stories
  const userStories = user ? storiesByUser[user.id] || [] : [];
  const userLatestStory = userStories.length > 0 ? userStories[userStories.length - 1] : null;
  const hasUserStories = userStories.length > 0;

  const openUserStories = (userId: string) => {
    router.push({ pathname: '/screens/StoryViewerScreen', params: { userId } });
  };

  // Function to pause all videos
  const pauseAllVideos = useCallback(() => {
    setPlayingVideoId(null);
    Object.values(videoRefs.current).forEach(ref => {
      if (ref && ref.pauseAsync) {
        ref.pauseAsync();
      }
    });
  }, []);

  useEffect(() => {
    fetchPosts();
    fetchAllStories();
  }, []);
 
  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
      fetchAllStories();
    }, [])
  );

  // Pause all videos when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Pause all videos when leaving the screen
        pauseAllVideos();
        setVisibleVideoIds(new Set());
      };
    }, [pauseAllVideos])
  );
 
  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
      // Pause all videos on unmount
      pauseAllVideos();
      setVisibleVideoIds(new Set());
    };
  }, [pauseAllVideos]);

  const fetchPosts = async () => {
    setLoadingPosts(true);
    try {
      const data = await getPosts();
      setPosts(data.reverse());
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Function to add a new post to the beginning of the list
  const addNewPost = (newPost: Post) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  // Function to update a specific post in the list
  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, ...updates } : post
      )
    );
  };

  // Function to remove a post from the list
  const removePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  const fetchAllStories = async () => {
    setLoadingStories(true);
    try {
      const data = await fetchStories();
      setStories(data);
    } finally {
      setLoadingStories(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPosts(), fetchAllStories()]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await deletePost(postId, user.id);
              removePost(postId);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete post');
            }
          }
        },
      ]
    );
  };

  const handleLikePost = async (post: Post) => {
    if (!user?.id) {
      Alert.alert('Error', 'User not found');
      return;
    }
    
    const alreadyLiked = (optimisticLikes[post.id] || post.likedBy || []).includes(user.id);
    
    // Optimistic update
    setOptimisticLikes(prev => ({
      ...prev,
      [post.id]: alreadyLiked 
        ? (prev[post.id] || post.likedBy || []).filter(id => id !== user.id)
        : [...(prev[post.id] || post.likedBy || []), user.id]
    }));

    try {
      if (alreadyLiked) {
        const response = await unlikePost(post.id, user.id);
        // Update the post with the response from server
        updatePost(post.id, {
          likedBy: response.likedBy || [],
          likeCount: response.likeCount || 0
        });
      } else {
        const response = await likePost(post.id, user.id);
        // Update the post with the response from server
        updatePost(post.id, {
          likedBy: response.likedBy || [],
          likeCount: response.likeCount || 0
        });
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
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleShareMedia = async (post: Post) => {
    try {
      const mediaUrl = post.videoUrl || post.imageUrl;
      if (mediaUrl) {
        await Share.share({
          message: `Check out this post: ${post.content}`,
          url: mediaUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing media:', error);
    }
  };

  const handlePostTap = (post: Post) => {
    if (!user) return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 250; // 250ms for double tap (more responsive)
    
    if (lastTap.current && 
        lastTap.current.postId === post.id && 
        now - lastTap.current.time < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
      lastTap.current = null;
      
      // Set the heart animation for this post
      setDoubleTapHeart({ postId: post.id, visible: true });
      
      // Animate the heart
      heartAnimation.setValue(0);
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDoubleTapHeart(null);
      });
      
      // Handle the like
      handleLikePost(post);
    } else {
      // First tap - wait for potential double tap
      lastTap.current = { postId: post.id, time: now };
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
      doubleTapTimer.current = setTimeout(() => {
        lastTap.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleVideoTap = (post: Post) => {
    // Handle double-tap first
    handlePostTap(post);
    
    // Then handle video play/pause
    const newPlayingId = playingVideoId === post.id ? null : post.id;
    setPlayingVideoId(newPlayingId);
    
    // Handle video ref directly
    if (videoRefs.current[post.id]) {
      if (newPlayingId === post.id) {
        videoRefs.current[post.id].playAsync();
      } else {
        videoRefs.current[post.id].pauseAsync();
      }
    }
  };

  // Separate function for play button tap (no double-tap interference)
  const handlePlayButtonTap = (post: Post) => {
    // Pause all other videos first
    Object.keys(videoRefs.current).forEach((videoId) => {
      if (videoId !== post.id && videoRefs.current[videoId]) {
        videoRefs.current[videoId].pauseAsync();
      }
    });
    
    const newPlayingId = playingVideoId === post.id ? null : post.id;
    setPlayingVideoId(newPlayingId);
    
    // Handle video ref directly
    if (videoRefs.current[post.id]) {
      if (newPlayingId === post.id) {
        // Ensure position reset when switching videos to prevent stalled frames
        videoRefs.current[post.id].setPositionAsync(0).then(() => {
          videoRefs.current[post.id].playAsync();
        });
      } else {
        videoRefs.current[post.id].pauseAsync();
      }
    }
  };



  // Handle scroll events to track video visibility
  const handleScroll = useCallback((event: any) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const screenHeight = Dimensions.get('window').height;
    const headerHeight = 120; // Approximate header height
    const statusBarHeight = 60; // Approximate status bar height
    const storiesHeight = 120; // Approximate stories height
    
    // Calculate which videos should be visible
    const newVisibleVideoIds = new Set<string>();
    let currentY = headerHeight + statusBarHeight + storiesHeight;
    
    posts.forEach((post, index) => {
      if (post.videoUrl) {
        // Calculate post position more accurately per item
        const postHeight = 480; // Slightly larger to include paddings/margins
        const videoTop = currentY;
        const videoBottom = currentY + postHeight;
        
        // Check if video is in viewport (with some buffer)
        const viewportTop = scrollY;
        const viewportBottom = scrollY + screenHeight;
        
        if (videoBottom > viewportTop && videoTop < viewportBottom) {
          newVisibleVideoIds.add(post.id);
        }
        
        currentY += postHeight;
      } else {
        // For non-video posts, add measured height fallback
        currentY += 260;
      }
    });
    
    setVisibleVideoIds(newVisibleVideoIds);
    
    // Pause all videos that are no longer visible
    Object.keys(videoRefs.current).forEach((videoId) => {
      if (!newVisibleVideoIds.has(videoId)) {
        if (videoRefs.current[videoId]) {
          videoRefs.current[videoId].pauseAsync();
        }
      }
    });
    
    // Update playing video state
    if (playingVideoId && !newVisibleVideoIds.has(playingVideoId)) {
      setPlayingVideoId(null);
    }
  }, [posts, playingVideoId]);

  // Check if a video should be playing
  const shouldVideoPlay = useCallback((postId: string) => {
    return playingVideoId === postId && visibleVideoIds.has(postId);
  }, [playingVideoId, visibleVideoIds]);

  // Helper function to check if a post is liked by current user
  const getIsLiked = useCallback((post: Post) => {
    if (!user?.id) return false;
    const optimisticLikesForPost = optimisticLikes[post.id] || post.likedBy || [];
    return optimisticLikesForPost.includes(user.id);
  }, [user?.id, optimisticLikes]);

  const handleImageFullScreen = (imageUrl: string) => {
    setFullscreenImage({ uri: imageUrl, visible: true });
  };

  const navigateToProfile = (userId: string) => {
    if (userId === user?.id) {
      router.push('/(tabs)/profile');
    } else {
      router.push({ pathname: '../screens/FriendsProfileScreen', params: { userId } });
    }
  };

  const handleOpenFullscreen = (type: 'image' | 'video', uri: string, id?: string, idx?: number) => {
    setFullscreenMedia({ type, uri, id });
    setFullscreenIndex(idx ?? 0);
  };

  if (loadingStories || loadingPosts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const userStory = stories.find(s => s.userId === user?.id);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      {/* Custom Header with Original Buttons */}
      <BlurView
        intensity={80}
        tint={currentTheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: colors.tabBarBg, borderBottomColor: colors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => setShowIntroVideo(true)}>
            <Text style={styles.headerTitle}>
              <Text style={{ color: '#4361EE' }}>Mas</Text>
              <Text style={{ color: '#FF7F11' }}>Chat</Text>
            </Text>
          </TouchableOpacity>
          
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => setShowAddMenu(true)}>
              <Ionicons name="add" size={28} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/screens/SearchScreen')}>
              <Ionicons name="search" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/screens/MessengerScreen')}>
              <Ionicons name="chatbubble-ellipses" size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/screens/MassCoinDashboardScreen')}>
              <MassCoinIcon size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>

      {/* Add Menu Modal */}
      <Modal
        visible={showAddMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMenu(false)}
      >
        <TouchableOpacity style={styles.addMenuOverlay} activeOpacity={1} onPress={() => setShowAddMenu(false)}>
          <View style={styles.addMenuContainer}>
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { setShowAddMenu(false); router.push('/(create)/newPost'); }}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} style={styles.addMenuIcon} />
              <Text style={styles.addMenuLabel}>New Post</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { setShowAddMenu(false); router.push('/(create)/newStory'); }}>
              <Ionicons name="book-outline" size={24} color={colors.primary} style={styles.addMenuIcon} />
              <Text style={styles.addMenuLabel}>New Story</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { setShowAddMenu(false); router.push('/(create)/newReel'); }}>
              <Ionicons name="film-outline" size={24} color={colors.primary} style={styles.addMenuIcon} />
              <Text style={styles.addMenuLabel}>New Reel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMenuItem} onPress={() => { setShowAddMenu(false); router.push('/(create)/LiveScreen'); }}>
              <Ionicons name="radio-outline" size={24} color={colors.primary} style={styles.addMenuIcon} />
              <Text style={styles.addMenuLabel}>Go Live</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addMenuClose} onPress={() => setShowAddMenu(false)}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Intro Video Modal */}
      <Modal
        visible={showIntroVideo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIntroVideo(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowIntroVideo(false)}>
          <View style={styles.videoModalContainer}>
            <Video
              key={videoKey}
              source={require('../../assets/GROUP 88-MasChat.mp4')}
              style={styles.introVideo}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              useNativeControls={false}
              isLooping={false}
              onPlaybackStatusUpdate={status => {
                if (status.isLoaded && 'didJustFinish' in status && status.didJustFinish) {
                  setShowIntroVideo(false);
                }
              }}
            />
            <TouchableOpacity 
              style={styles.closeVideoButton} 
              onPress={() => setShowIntroVideo(false)}
            >
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Story Viewer Modal */}
      {storyViewerVisible && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setStoryViewerVisible(false)}>
          <View style={styles.storyViewerContainer}>
            {currentUserStories.length > 0 && (
              <FlatList
                data={currentUserStories}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={item => item.id}
                initialScrollIndex={currentStoryIndex}
                renderItem={({ item }) => (
                  item.mediaUrl.endsWith('.mp4') || item.mediaUrl.endsWith('.mov') ? (
                    <Video
                      source={{ uri: item.mediaUrl }}
                      style={styles.storyVideo}
                      resizeMode={ResizeMode.COVER}
                      shouldPlay
                      isLooping
                      useNativeControls={false}
                    />
                  ) : (
                    <Image source={{ uri: item.mediaUrl }} style={styles.storyImageFull} />
                  )
                )}
              />
            )}
            <TouchableOpacity style={styles.closeStoryButton} onPress={() => setStoryViewerVisible(false)}>
              <Ionicons name="close" size={36} color="#fff" />
            </TouchableOpacity>
            <View style={styles.storyHeader}>
              <Image 
                source={{ uri: currentStoryUser?.profilePicture || DEFAULT_PROFILE_PHOTO }} 
                style={styles.storyUserAvatar} 
              />
              <Text style={styles.storyUsername}>{currentStoryUser?.username}</Text>
            </View>
          </View>
        </Modal>
      )}

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scroll} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Status Bar */}
        <View style={styles.statusContainer}>
          <TouchableOpacity onPress={() => router.push('/profile')}>
            <LinearGradient
              colors={[COLORS.light.accent, '#FF6B35']}
              style={styles.profileRing}
            >
              <Image
                source={{
                  uri: (user && user.profilePicture) ? user.profilePicture : DEFAULT_PROFILE_PHOTO,
                }}
                style={styles.profilePic}
              />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.statusInput}
            onPress={() => router.push("/(create)/newPost")}
          >
            <Text style={styles.statusPlaceholder}>
              What's on your mind?
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.photoBtn}
            onPress={() => router.push('/(create)/newPost')}
          >
            <Ionicons name="image" size={28} color={COLORS.light.accent} />
          </TouchableOpacity>
        </View>

        {/* Stories */}
        <View style={styles.storiesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storiesContent}
          >
            {/* User's Story Circle - First Position */}
            <TouchableOpacity
              style={styles.storyItem}
              onPress={() => {
                if (user && hasUserStories && user.id) {
                  // Show user's own stories
                  openUserStories(user.id);
                } else {
                  // Navigate to create new story
                  router.push('/(create)/newStory');
                }
              }}
            >
              <View style={hasUserStories ? styles.storyRing : styles.storyImageContainer}>
                <Image
                  source={{
                    uri: hasUserStories && userLatestStory 
                      ? getStoryThumbnail(userLatestStory)
                      : (user && user.profilePicture) ? user.profilePicture : DEFAULT_PROFILE_PHOTO,
                  }}
                  style={styles.storyImage}
                />
                {!hasUserStories && (
                  <View style={styles.addStoryIcon}>
                    <Ionicons name="add" size={20} color="white" />
                  </View>
                )}
              </View>
              <Text style={styles.storyLabel}>
                {hasUserStories ? 'Your Story' : 'Create New Story'}
              </Text>
            </TouchableOpacity>

            {/* Other Users' Stories - Each user gets their own circle */}
            {uniqueStoryUsers
              .filter(story => story.userId !== (user?.id || '')) // Exclude current user since they're already shown above
              .map((story) => {
                const latestStory = getLatestStoryForUser(story.userId);
                return (
                  <TouchableOpacity
                    key={story.id}
                    style={styles.storyItem}
                    onPress={() => story.userId && openUserStories(story.userId)}
                  >
                    <View style={styles.storyRing}>
                      <Image
                        source={{
                          uri: getStoryThumbnail(latestStory || story),
                        }}
                        style={styles.storyImage}
                      />
                    </View>
                    <Text style={styles.storyLabel} numberOfLines={1}>
                      {story.username}
                    </Text>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
        </View>

        {/* Posts */}
        {loadingPosts ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={60} color={colors.lightText} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubtext}>Be the first to share something!</Text>
            <TouchableOpacity 
              style={styles.createBtn} 
              onPress={() => router.push('/(create)/newPost')}
            >
              <Text style={styles.createBtnText}>Create New Post</Text>
            </TouchableOpacity>
          </View>
        ) : (
          posts.map((post, idx) => (
            <View key={post.id} style={styles.postCard}>
              {/* Post Header */}
              <View style={styles.postHeader}>
                <TouchableOpacity 
                  style={styles.postUser} 
                  onPress={() => navigateToProfile(post.user.id)}
                >
                  <Image
                    source={{ uri: post.user.profilePicture || DEFAULT_PROFILE_PHOTO }}
                    style={styles.postAvatar}
                  />
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{post.user.username}</Text>
                    <Text style={styles.postTime}>{formatPostTime(post.createdAt)}</Text>
                  </View>
                </TouchableOpacity>
                
                {user?.id === post.user.id && (
                  <TouchableOpacity 
                    style={styles.moreButton}
                    onPress={() => handleDeletePost(post.id)}
                  >
                    <Ionicons name="ellipsis-horizontal" size={24} color={colors.lightText} />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Post Content */}
              <Text style={styles.postText}>{post.content}</Text>
              
              {/* Media */}
              {(post.imageUrl || post.videoUrl) && (
                post.videoUrl ? (
                  <View style={styles.videoContainer}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleVideoTap(post)}
                      style={styles.videoTouchable}
                    >
                      {videoLoading[post.id] && (
                        <ActivityIndicator size="large" color="#fff" style={styles.videoLoader} />
                      )}
                      <Video
                        ref={(ref) => {
                          if (ref) {
                            videoRefs.current[post.id] = ref;
                          }
                        }}
                        source={{ uri: post.videoUrl || '' }}
                        style={styles.postVideo}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay={shouldVideoPlay(post.id)}
                        isLooping
                        useNativeControls={false}
                         isMuted={false}
                         rate={1.0}
                         volume={1.0}
                         progressUpdateIntervalMillis={250}
                        onLoadStart={() => setVideoLoading(v => ({ ...v, [post.id]: true }))}
                        onReadyForDisplay={() => setVideoLoading(v => ({ ...v, [post.id]: false }))}
                        onPlaybackStatusUpdate={(status) => {
                          if (status.isLoaded) {
                            // Sync video state with our state
                            if (status.isPlaying && !shouldVideoPlay(post.id)) {
                              // Video is playing but shouldn't be - pause it
                              if (videoRefs.current[post.id]) {
                                videoRefs.current[post.id].pauseAsync();
                              }
                            } else if (!status.isPlaying && shouldVideoPlay(post.id)) {
                              // Video should be playing but isn't - play it
                              if (videoRefs.current[post.id]) {
                                videoRefs.current[post.id].playAsync();
                              }
                            }
                          }
                        }}
                      />
                      <TouchableOpacity
                        style={styles.playButton}
                        onPress={() => handlePlayButtonTap(post)}
                      >
                        <Ionicons 
                          name={shouldVideoPlay(post.id) ? 'pause-circle' : 'play-circle'} 
                          size={56} 
                          color="rgba(255,255,255,0.8)" 
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => handleOpenFullscreen('video', post.videoUrl || '', post.id, idx)}
                      >
                        <Ionicons name="expand" size={24} color="#fff" />
                      </TouchableOpacity>
                      
                      {/* Double-tap heart animation for videos */}
                      {doubleTapHeart?.postId === post.id && doubleTapHeart.visible && (
                        <Animated.View
                          style={[
                            styles.doubleTapHeart,
                            {
                              opacity: heartAnimation,
                              transform: [
                                {
                                  scale: heartAnimation.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.3, 1.5],
                                  }),
                                },
                              ],
                            },
                          ]}
                        >
                          <Ionicons name="heart" size={80} color="#FF3040" />
                        </Animated.View>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.imageContainer}>
                    <TouchableOpacity 
                      activeOpacity={0.9}
                      onPress={() => handleOpenFullscreen('image', post.imageUrl || '', post.id, idx)}
                    >
                      <Image 
                        source={{ uri: post.imageUrl || '' }} 
                        style={styles.postImage} 
                      />
                    </TouchableOpacity>
                    
                    {/* Double-tap overlay for like */}
                    <TouchableOpacity
                      style={styles.doubleTapOverlay}
                      onPress={() => handlePostTap(post)}
                      activeOpacity={1}
                    >
                      <View style={styles.doubleTapArea} />
                    </TouchableOpacity>
                    
                    {/* Full-screen button for images */}
                    <TouchableOpacity
                      style={styles.fullscreenImageButton}
                      onPress={() => handleImageFullScreen(post.imageUrl || '')}
                    >
                      <Ionicons name="expand" size={24} color="#fff" />
                    </TouchableOpacity>
                    
                    {/* Double-tap heart animation */}
                    {doubleTapHeart?.postId === post.id && doubleTapHeart.visible && (
                      <Animated.View
                        style={[
                          styles.doubleTapHeart,
                          {
                            opacity: heartAnimation,
                            transform: [
                              {
                                scale: heartAnimation.interpolate({
                                  inputRange: [0, 1],
                                  outputRange: [0.3, 1.5],
                                }),
                              },
                            ],
                          },
                        ]}
                      >
                        <Ionicons name="heart" size={80} color="#FF3040" />
                      </Animated.View>
                    )}
                  </View>
                )
              )}
              
              {/* Post Stats */}
              <View style={styles.postStats}>
                <View style={styles.likeCountContainer}>
                  <Ionicons name="heart" size={16} color={LIKE_ACTIVE_COLOR} />
                  <Text style={styles.likeCountText}>
                    {optimisticLikes[post.id] ? optimisticLikes[post.id].length : (post.likeCount || (post.likedBy || []).length)}
                  </Text>
                </View>
                <Text style={styles.commentCountText}>
                  {post.commentCount || post.comments?.length || 0} comments • {post.shareCount || 0} shares
                </Text>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.postActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => user && handleLikePost(post)}
                >
                  <Ionicons
                    name={getIsLiked(post) ? 'heart' : 'heart-outline'}
                    size={24}
                    color={getIsLiked(post) ? LIKE_ACTIVE_COLOR : colors.lightText}
                  />
                  <Text style={[
                    styles.actionText,
                    getIsLiked(post) && { color: LIKE_ACTIVE_COLOR }
                  ]}>
                    Like
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedPostId(post.id);
                    setShowCommentDialog(true);
                  }}
                >
                  <Ionicons 
                    name="chatbubble-outline" 
                    size={22} 
                    color={colors.lightText} 
                  />
                  <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleShareMedia(post)}
                >
                  <Ionicons 
                    name="arrow-redo-outline" 
                    size={24} 
                    color={colors.lightText} 
                  />
                  <Text style={styles.actionText}>Share</Text>
                </TouchableOpacity>

                {/* Mass Coin Tip Button */}
                {user && user.id !== post.user.id && (
                  <MassCoinTipButton
                    postId={post.id}
                    creatorId={post.user.id}
                    creatorName={post.user.fullName || post.user.username}
                    size="small"
                  />
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Fullscreen Modal */}
      {fullscreenMedia && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setFullscreenMedia(null)}>
          <View style={styles.fullscreenContainer}>
            {fullscreenMedia.type === 'image' ? (
              <Image 
                source={{ uri: fullscreenMedia.uri || '' }} 
                style={styles.fullscreenImage} 
                resizeMode="contain"
              />
            ) : (
              <Video
                source={{ uri: fullscreenMedia.uri || '' }}
                style={styles.fullscreenVideo}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay
                isLooping
                useNativeControls
              />
            )}
            <TouchableOpacity 
              style={styles.closeFullscreenButton} 
              onPress={() => setFullscreenMedia(null)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      
      {/* Full-screen Image Modal */}
      {fullscreenImage?.visible && (
        <Modal visible transparent animationType="fade" onRequestClose={() => setFullscreenImage(null)}>
          <View style={styles.fullscreenImageContainer}>
            <Image 
              source={{ uri: fullscreenImage.uri }} 
              style={styles.fullscreenImageModal} 
              resizeMode="contain"
            />
            <TouchableOpacity 
              style={styles.closeFullscreenButton} 
              onPress={() => setFullscreenImage(null)}
            >
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Comment Dialog */}
      {showCommentDialog && user && (
        <CommentDialog
          postId={selectedPostId}
          userId={user.id}
          onClose={() => setShowCommentDialog(false)}
          onComment={() => {
            // Refresh posts to show new comment
            fetchPosts();
          }}
          postOwnerId={posts.find(p => p.id === selectedPostId)?.user.id}
        />
      )}
    </View>
  );
}

function formatPostTime(isoString: string) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  if (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  ) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString();
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
    backgroundColor: COLORS.light.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: currentColors.lightText,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  logo: {
    fontSize: 28,
    fontWeight: '800',
    color: currentColors.text,
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 16,
    marginLeft: 'auto',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: currentColors.accent,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  notificationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: currentColors.card,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  profileRing: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profilePic: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.light.card,
  },
  statusInput: {
    flex: 1,
    backgroundColor: currentColors.background,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 12,
  },
  statusPlaceholder: {
    color: currentColors.lightText,
    fontSize: 16,
  },
  photoBtn: {
    backgroundColor: currentColors.background,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storiesContainer: {
    marginVertical: 8,
    paddingLeft: 16,
  },
  storiesContent: {
    paddingRight: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 3,
    borderColor: currentColors.accent,
  },
  storyImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: currentColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  storyImage: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
  addStoryIcon: {
    backgroundColor: currentColors.primary,
    borderRadius: 20,
    padding: 4,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  storyLabel: {
    fontSize: 12,
    color: currentColors.text,
    fontWeight: '500',
    maxWidth: 80,
    textAlign: 'center',
  },
  postCard: {
    backgroundColor: currentColors.card,
    borderRadius: 0,
    margin: 0,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    justifyContent: 'space-between',
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  postUserInfo: {
    justifyContent: 'center',
  },
  postUserName: {
    fontWeight: '700',
    fontSize: 16,
    color: currentColors.text,
    marginBottom: 2,
  },
  postTime: {
    color: currentColors.lightText,
    fontSize: 13,
  },
  moreButton: {
    padding: 8,
  },
  postText: {
    fontSize: 16,
    color: currentColors.text,
    lineHeight: 24,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postImage: {
    width: '100%',
    height: DEVICE_WIDTH * 1.5,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: DEVICE_WIDTH * 1.5,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  videoTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  postVideo: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoLoader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -18,
    marginLeft: -18,
    zIndex: 10,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -28,
    marginLeft: -28,
    zIndex: 10,
  },
  expandButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  postStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
  },
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCountText: {
    marginLeft: 6,
    color: currentColors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  commentCountText: {
    color: currentColors.lightText,
    fontSize: 14,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  actionText: {
    marginLeft: 8,
    fontSize: 16,
    color: currentColors.lightText,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  addMenuBox: {
    marginTop: 60,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: currentColors.card,
    paddingVertical: 8,
    width: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  addMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    width: '100%',
  },
  menuIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: currentColors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: currentColors.lightText,
    marginBottom: 24,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: currentColors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  createBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  videoModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  introVideo: {
    width: '100%',
    height: '100%',
  },
  closeVideoButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  storyVideo: {
    width: '100%',
    height: '100%',
  },
  storyImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  closeStoryButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  storyHeader: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  storyUserAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.light.primary,
  },
  storyUsername: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: DEVICE_WIDTH * 1.5,
    backgroundColor: '#000',
  },
  fullscreenImageButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -40,
    marginLeft: -40,
    zIndex: 10,
  },
  doubleTapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  doubleTapArea: {
    flex: 1,
  },
  fullscreenImageContainer: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImageModal: {
    width: '100%',
    height: '100%',
  },
  modernHeader: {
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  addMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMenuContainer: {
    backgroundColor: currentColors.card,
    borderRadius: 20,
    padding: 24,
    width: 260,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  addMenuIcon: {
    marginRight: 16,
  },
  addMenuLabel: {
    fontSize: 16,
    color: currentColors.text,
    fontWeight: '500',
  },
  addMenuClose: {
    marginTop: 12,
    alignSelf: 'center',
  }
});