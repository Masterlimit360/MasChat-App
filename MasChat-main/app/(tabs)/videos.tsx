import React, { useEffect, useState, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions, AppState, Share, Animated, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { fetchReels, deleteReel, Reel, likeReel, unlikeReel, shareReel, getReelMediaUrl, hasValidMedia } from '../lib/services/reelService';
import { Video, ResizeMode } from 'expo-av';
import CommentDialog from "../components/CommentDialog";
import MenuModal from '../components/MenuModal';
import MassCoinTipButton from '../../components/MassCoinTipButton';
import { Colors } from '../../constants/Colors';
import client from '../api/client';

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
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',
    dark: '#1A1A2E',
  },
};

const LIKE_ACTIVE_COLOR = '#FF3040';
const LIKE_INACTIVE_COLOR = Colors.light.text;
const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get('window');

export default function Videos() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = currentTheme === 'dark' ? COLORS.dark : COLORS.light;
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalReel, setCommentModalReel] = useState<Reel | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [reelId: string]: string[] }>({});
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoSpeed, setVideoSpeed] = useState(1);
  const reelsScrollRef = useRef<ScrollView>(null);
  const videoRefs = useRef<any[]>([]);
  const appState = useRef(AppState.currentState);
  const [videoLoading, setVideoLoading] = useState<{ [key: number]: boolean }>({});
  const [videoErrors, setVideoErrors] = useState<{ [key: number]: boolean }>({});
  const [videoRetryCount, setVideoRetryCount] = useState<{ [key: number]: number }>({});
  const [refreshing, setRefreshing] = useState(false);
  
  // Function to retry video loading
  const retryVideoLoad = (index: number) => {
    const currentRetryCount = videoRetryCount[index] || 0;
    if (currentRetryCount < 3) {
      setVideoRetryCount(v => ({ ...v, [index]: currentRetryCount + 1 }));
      setVideoErrors(v => ({ ...v, [index]: false }));
      setVideoLoading(v => ({ ...v, [index]: true }));
      
      // Force re-render of video component with optimized URL
      const videoRef = videoRefs.current[index];
      if (videoRef && videoRef.loadAsync) {
        const originalUrl = getReelMediaUrl(reels[index]);
        const optimizedUrl = getOptimizedVideoUrl(originalUrl);
        videoRef.loadAsync({ uri: optimizedUrl }, {}, false);
      }
    }
  };

  // Function to preload video URLs to check accessibility
  const preloadVideoUrl = async (url: string): Promise<boolean> => {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'User-Agent': 'MasChat/1.0',
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Preload check failed for URL:', url, error);
      return false;
    }
  };

  // Function to get optimized video URL
  const getOptimizedVideoUrl = (originalUrl: string): string => {
    if (!originalUrl.includes('cloudinary.com')) {
      return originalUrl;
    }

    // Ensure HTTPS
    let url = originalUrl.startsWith('http://') ? originalUrl.replace('http://', 'https://') : originalUrl;
    
    // Add Cloudinary optimizations for better mobile loading
    if (url.includes('/upload/') && !url.includes('/upload/f_auto,q_auto/')) {
      url = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    
    return url;
  };
  
  // Double tap like functionality
  const lastTap = useRef<{ reelId: string; time: number } | null>(null);
  const doubleTapTimer = useRef<NodeJS.Timeout | null>(null);
  const [doubleTapHeart, setDoubleTapHeart] = useState<{ reelId: string; visible: boolean } | null>(null);
  const heartAnimation = useRef(new Animated.Value(0)).current;

  const testReelsEndpoint = async () => {
    try {
      console.log('Testing reels endpoint...');
      const response = await client.get('/reels/test');
      console.log('Test endpoint response:', response.data);
    } catch (error) {
      console.error('Test endpoint error:', error);
    }
  };

  useEffect(() => {
    fetchAllReels();
    // Test the endpoint to see what's in the database
    testReelsEndpoint();
  }, []);

  // Refresh reels when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAllReels();
    }, [])
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);

  // Apply mute state to current video when mute state changes
  useEffect(() => {
    const currentVideoRef = videoRefs.current[currentReelIndex];
    if (currentVideoRef && currentVideoRef.setIsMutedAsync) {
      currentVideoRef.setIsMutedAsync(muted);
    }
  }, [muted, currentReelIndex]);

  // Pause all videos when leaving the screen
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        pauseAllVideos();
      };
    }, [])
  );

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState !== 'active') {
      pauseAllVideos();
    }
  };

  const pauseAllVideos = () => {
    videoRefs.current.forEach(ref => {
      if (ref && ref.pauseAsync) ref.pauseAsync();
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAllReels(true);
    setRefreshing(false);
  };

  const fetchAllReels = async (forceRefresh: boolean = false) => {
    setLoading(true);
    try {
      console.log('Videos tab: Fetching reels...', forceRefresh ? '(force refresh)' : '(with cache)');
      const data = await fetchReels(forceRefresh);
      console.log('Videos tab: Raw reels data:', data);
      console.log('Videos tab: Data type:', typeof data);
      console.log('Videos tab: Is array:', Array.isArray(data));
      
      if (!Array.isArray(data)) {
        console.error('Videos tab: Data is not an array:', data);
        setReels([]);
        return;
      }
      
      const filteredReels = data.filter(r => r.id && r.id !== 'undefined' && r.id !== undefined);
      console.log('Videos tab: Filtered reels:', filteredReels);
      console.log('Videos tab: Number of reels after filtering:', filteredReels.length);
      
      // Log each reel's structure
      filteredReels.forEach((reel, index) => {
        console.log(`Reel ${index}:`, {
          id: reel.id,
          userId: reel.userId,
          username: reel.username,
          mediaUrl: reel.mediaUrl,
          videoUrl: reel.videoUrl,
          caption: reel.caption
        });
      });
      
      setReels(filteredReels);
    } catch (error) {
      console.error('Videos tab: Error fetching reels:', error);
      if (!forceRefresh) {
        Alert.alert('Error', 'Failed to load reels. Please try again.');
      }
      setReels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reelId: string) => {
    if (!user?.id) return;
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteReel(reelId, user.id);
        setMenuVisible(false);
        fetchAllReels();
      }},
    ]);
  };

  const handleLikeReel = async (reel: Reel) => {
    if (!user || !user.id || !(reel.id || '')) return;
    const alreadyLiked = (optimisticLikes[String(reel.id)] || reel.likedBy || []).includes(String(user.id));
    setOptimisticLikes(prev => ({
      ...prev,
      [String(reel.id)]: alreadyLiked
        ? (prev[String(reel.id)] || reel.likedBy || []).filter(id => id !== String(user.id))
        : [...(prev[String(reel.id)] || reel.likedBy || []), String(user.id)]
    }));
    try {
      if (alreadyLiked) {
        const response = await unlikeReel(String(reel.id), String(user.id));
        // Update the reel with the response from server
        setReels(prevReels => 
          prevReels.map(r => 
            r.id === reel.id 
              ? { ...r, likedBy: response.likedBy || [], likeCount: response.likeCount || 0 }
              : r
          )
        );
      } else {
        const response = await likeReel(String(reel.id), String(user.id));
        // Update the reel with the response from server
        setReels(prevReels => 
          prevReels.map(r => 
            r.id === reel.id 
              ? { ...r, likedBy: response.likedBy || [], likeCount: response.likeCount || 0 }
              : r
          )
        );
      }
      
      // Clear optimistic update after successful server response
      setOptimisticLikes(prev => {
        const newState = { ...prev };
        delete newState[String(reel.id)];
        return newState;
      });
    } catch (err) {
      // Revert optimistic update on error
      setOptimisticLikes(prev => ({
        ...prev,
        [String(reel.id)]: alreadyLiked
          ? [...(prev[String(reel.id)] || reel.likedBy || []), String(user.id)]
          : (prev[String(reel.id)] || reel.likedBy || []).filter(id => id !== String(user.id))
      }));
      console.error('Like error:', err);
    }
  };

  const handleShare = async (reelId: string) => {
    await shareReel(reelId || '');
    fetchAllReels();
  };

  // Helper to share reel media
  const handleShareMedia = async (reel: Reel) => {
    try {
      const r = reel as Reel & { videoUrl?: string; imageUrl?: string };
      const url = r.videoUrl || r.imageUrl || r.mediaUrl;
      if (!url) {
        Alert.alert('Nothing to share', 'No media found in this reel.');
        return;
      }
      await Share.share({
        message: url,
        url: url,
        title: 'Check out this reel on MasChat!'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share media.');
    }
  };

  const handleReelScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / DEVICE_HEIGHT);
    setCurrentReelIndex(newIndex);
    setPaused(false); // auto-play on scroll
    videoRefs.current.forEach((ref, idx) => {
      if (ref && ref.pauseAsync && idx !== newIndex) ref.pauseAsync();
      if (ref && ref.playAsync && idx === newIndex) ref.playAsync();
    });
    // Apply mute state to the new video
    const newVideoRef = videoRefs.current[newIndex];
    if (newVideoRef && newVideoRef.setIsMutedAsync) {
      newVideoRef.setIsMutedAsync(muted);
    }
  };

  const handleVideoPress = (index: number) => {
    setPaused((prev) => {
      const newPaused = !prev;
      const ref = videoRefs.current[index];
      if (ref) {
        if (newPaused) ref.pauseAsync();
        else ref.playAsync();
      }
      return newPaused;
    });
  };

  const handleReelTap = (reel: Reel) => {
    if (!user) return;
    
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 250; // 250ms for double tap (more responsive)
    
    if (lastTap.current && 
        lastTap.current.reelId === reel.id && 
        now - lastTap.current.time < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (doubleTapTimer.current) {
        clearTimeout(doubleTapTimer.current);
      }
      lastTap.current = null;
      
      // Set the heart animation for this reel
      setDoubleTapHeart({ reelId: reel.id, visible: true });
      
      // Animate the heart
      heartAnimation.setValue(0);
      Animated.sequence([
        Animated.timing(heartAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setDoubleTapHeart(null);
      });
      
      // Like the reel if not already liked
      const alreadyLiked = (optimisticLikes[reel.id] || reel.likedBy || []).includes(String(user.id));
      if (!alreadyLiked) {
        handleLikeReel(reel);
      }
    } else {
      // Single tap - pause/play video
      const currentIndex = reels.findIndex(r => r.id === reel.id);
      if (currentIndex !== -1) {
        handleVideoPress(currentIndex);
      }
      
      // Set up for potential double tap
      lastTap.current = { reelId: reel.id, time: now };
      doubleTapTimer.current = setTimeout(() => {
        lastTap.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleMuteToggle = () => {
    setMuted((prev) => {
      const newMuted = !prev;
      // Update the current video's mute state
      const ref = videoRefs.current[currentReelIndex];
      if (ref && ref.setIsMutedAsync) {
        ref.setIsMutedAsync(newMuted);
      }
      return newMuted;
    });
  };

  const handleSpeedChange = (speed: number) => {
    setVideoSpeed(speed);
    const ref = videoRefs.current[currentReelIndex];
    if (ref) ref.setRateAsync(speed, false);
  };

  const formatNumber = (num: number): string => {
    if (!num || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const currentReel = reels[currentReelIndex] || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.reelsTitle}>Reels</Text>
        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-circle-outline" size={36} color="#fff" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.light.accent} />
      ) : reels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={60} color="#fff" />
          <Text style={styles.emptyText}>No reels yet.</Text>
          <TouchableOpacity 
            style={styles.createBtn} 
            onPress={() => router.push('/(create)/newReel')}
          >
            <LinearGradient
              colors={['#FF7F11', '#FF3040']}
              style={styles.gradientBtn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.createBtnText}>Create New Reel</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={reelsScrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleReelScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {reels.map((reel, index) => (
            <View key={reel.id} style={[styles.reelItem, { height: DEVICE_HEIGHT }]}> 
              {/* Video/Image Content */}
              <TouchableOpacity
                activeOpacity={1}
                style={styles.mediaContainer}
                onPress={() => handleReelTap(reel)}
              >
                {(() => {
                  const mediaUrl = getReelMediaUrl(reel);
                  const isValidMedia = hasValidMedia(reel);
                  
                  console.log(`Rendering reel ${reel.id}:`, {
                    mediaUrl,
                    isValidMedia,
                    originalVideoUrl: reel.videoUrl,
                    originalMediaUrl: reel.mediaUrl
                  });
                  
                  if (!isValidMedia) {
                    return (
                      <View style={[styles.fullVideo, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                        <Ionicons name="videocam-off" size={48} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 16, marginTop: 8 }}>Invalid media URL</Text>
                        <Text style={{ color: '#fff', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                          {mediaUrl || 'No URL provided'}
                        </Text>
                      </View>
                    );
                  }
                  
                  // Determine if this is a video based on file extension
                  const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);
                  
                  if (isVideo) {
                    const optimizedVideoUrl = getOptimizedVideoUrl(mediaUrl);
                    
                    return (
                      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                        {videoLoading[index] && (
                          <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
                        )}
                        {videoErrors[index] && (
                          <View style={{ position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -50 }, { translateY: -50 }], zIndex: 10, alignItems: 'center' }}>
                            <Ionicons name="videocam-off" size={48} color="#fff" />
                            <Text style={{ color: '#fff', fontSize: 16, marginTop: 8, textAlign: 'center' }}>Video failed to load</Text>
                            <Text style={{ color: '#fff', fontSize: 12, marginTop: 4, textAlign: 'center', opacity: 0.7 }}>
                              {(videoRetryCount[index] || 0) < 3 ? 'Check your connection and try again' : 'Video unavailable'}
                            </Text>
                            {(videoRetryCount[index] || 0) < 3 && (
                              <TouchableOpacity 
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 8 }}
                                onPress={() => retryVideoLoad(index)}
                              >
                                <Text style={{ color: '#fff', fontSize: 14 }}>Retry</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        )}
                        <Video
                          ref={ref => { videoRefs.current[index] = ref; return undefined; }}
                          source={{ 
                            uri: optimizedVideoUrl,
                            headers: {
                              'User-Agent': 'MasChat/1.0',
                              'Accept': 'video/*,*/*;q=0.9',
                              'Accept-Encoding': 'gzip, deflate, br',
                            },
                          }}
                          style={styles.fullVideo}
                          resizeMode={ResizeMode.COVER}
                          shouldPlay={index === currentReelIndex && !paused}
                          isLooping
                          useNativeControls={false}
                          isMuted={muted}
                          rate={videoSpeed}
                          volume={muted ? 0.0 : 1.0}
                          progressUpdateIntervalMillis={250}
                          onLoadStart={() => {
                            console.log('Video loading started for reel:', reel.id, 'URL:', optimizedVideoUrl);
                            setVideoLoading(v => ({ ...v, [index]: true }));
                            setVideoErrors(v => ({ ...v, [index]: false }));
                          }}
                          onReadyForDisplay={() => {
                            console.log('Video ready for display for reel:', reel.id);
                            setVideoLoading(v => ({ ...v, [index]: false }));
                            setVideoErrors(v => ({ ...v, [index]: false }));
                          }}
                          onError={(error: any) => {
                            console.error('Video error for reel:', reel.id, 'URL:', optimizedVideoUrl, error);
                            setVideoLoading(v => ({ ...v, [index]: false }));
                            setVideoErrors(v => ({ ...v, [index]: true }));
                            
                            // Log specific error details for debugging
                            if (error && typeof error === 'object' && error.error) {
                              console.error('Error details:', {
                                code: error.error.code,
                                domain: error.error.domain,
                                description: error.error.description,
                                userInfo: error.error.userInfo
                              });
                            }
                            
                            // Log retry information
                            const currentRetryCount = videoRetryCount[index] || 0;
                            console.log(`Video failed to load for reel ${reel.id}. Retry count: ${currentRetryCount}`);
                            
                            // Auto-retry for network timeouts (error code -1001)
                            if (error?.error?.code === -1001 && currentRetryCount < 2) {
                              console.log('Auto-retrying due to network timeout...');
                              setTimeout(() => retryVideoLoad(index), 2000);
                            }
                          }}
                          onLoad={() => {
                            console.log('Video loaded successfully for reel:', reel.id);
                            setVideoErrors(v => ({ ...v, [index]: false }));
                          }}
                        />
                      </View>
                    );
                  } else {
                    // Assume it's an image
                    return (
                      <Image 
                        source={{ uri: mediaUrl }} 
                        style={styles.fullImage} 
                        resizeMode="cover"
                        onError={(error) => console.error('Image error for reel:', reel.id, 'URL:', mediaUrl, error)}
                      />
                    );
                  }
                })()}
                
                {/* Mute/Unmute Button - only show for videos */}
                {(() => {
                  const mediaUrl = getReelMediaUrl(reel);
                  const isVideo = mediaUrl.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i);
                  return isVideo ? (
                    <TouchableOpacity
                      style={styles.muteButton}
                      onPress={handleMuteToggle}
                    >
                      <Ionicons 
                        name={muted ? "volume-mute" : "volume-high"} 
                        size={24} 
                        color="#fff" 
                      />
                    </TouchableOpacity>
                  ) : null;
                })()}
                
                {/* Double-tap heart animation */}
                {doubleTapHeart?.reelId === reel.id && doubleTapHeart.visible && (
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

              {/* Bottom Info Section */}
              <View style={styles.bottomInfo}>
                <View style={styles.userInfo}>
                  <Image 
                    source={{ uri: reel.profilePicture || 'https://i.pravatar.cc/150?img=3' }} 
                    style={styles.avatar} 
                  />
                  <Text style={styles.username}>@{reel.username}</Text>
                  <TouchableOpacity 
                    style={styles.followBtn}
                    onPress={() => {}}
                  >
                    <Text style={styles.followText}>Follow</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.caption}>{reel.caption}</Text>
                <View style={styles.soundInfo}>
                  <MaterialIcons name="music-note" size={14} color="#fff" />
                  <Text style={styles.soundText}>Original Sound</Text>
                </View>
              </View>

              {/* Right Action Buttons */}
              <View style={styles.rightActions}>
                {/* Like Button */}
                <TouchableOpacity 
                  onPress={() => handleLikeReel(reel)} 
                  style={styles.actionButton}
                >
                  <Ionicons 
                    name={(optimisticLikes[reel.id] || reel.likedBy || []).includes(String(user?.id)) ? "heart" : "heart-outline"} 
                    size={38} 
                    color={(optimisticLikes[reel.id] || reel.likedBy || []).includes(String(user?.id)) ? '#FF3040' : '#fff'}
                  />
                  <Text style={styles.actionCount}>
                    {formatNumber((optimisticLikes[reel.id] || reel.likedBy || []).length)}
                  </Text>
                </TouchableOpacity>

                {/* Mass Coin Tip Button */}
                {user && user.id !== reel.userId && (
                  <View style={styles.actionButton}>
                    <MassCoinTipButton
                      postId={reel.id}
                      creatorId={reel.userId}
                      creatorName={reel.username}
                      size="small"
                      style={styles.massCoinButton}
                    />
                  </View>
                )}

                {/* Comment Button */}
                <TouchableOpacity 
                  onPress={() => setCommentModalReel(reel)} 
                  style={styles.actionButton}
                >
                  <Ionicons name="chatbubble-outline" size={34} color="#fff" />
                  <Text style={[styles.actionCount, { color: '#fff' }]}>{reel.comments ? reel.comments.length : 0}</Text>
                </TouchableOpacity>

                {/* Share Button */}
                <TouchableOpacity 
                  onPress={() => handleShareMedia(reel)} 
                  style={styles.actionButton}
                >
                  <Feather name="send" size={32} color="#fff" />
                  <Text style={styles.actionCount}>{formatNumber((reel as any).shareCount || 0)}</Text>
                </TouchableOpacity>

                {/* More Options (Menu) */}
                {user?.id === reel.userId && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSelectedReel(reel);
                      setMenuVisible(true);
                    }} 
                    style={styles.actionButton}
                  >
                    <FontAwesome name="ellipsis-v" size={28} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Comment Modal */}
      {commentModalReel && user?.id && (
        <CommentDialog
          postId={commentModalReel.id}
          userId={user.id}
          onClose={() => setCommentModalReel(null)}
          onComment={fetchAllReels}
        />
      )}

      {/* Menu Modal */}
      <MenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        items={[
          {
            label: 'Delete Reel',
            icon: 'trash-outline',
            color: 'red',
            onPress: () => selectedReel && handleDelete(selectedReel.id)
          },
          {
            label: 'Create New Reel',
            icon: 'add-circle-outline',
            onPress: () => router.push('/(create)/newReel')
          },
          { type: 'select', label: '0.5x', icon: 'speedometer-outline', selected: videoSpeed === 0.5, onPress: () => handleSpeedChange(0.5) },
          { type: 'select', label: '1x', icon: 'speedometer-outline', selected: videoSpeed === 1, onPress: () => handleSpeedChange(1) },
          { type: 'select', label: '1.5x', icon: 'speedometer-outline', selected: videoSpeed === 1.5, onPress: () => handleSpeedChange(1.5) },
          { type: 'select', label: '2x', icon: 'speedometer-outline', selected: videoSpeed === 2, onPress: () => handleSpeedChange(2) },
          {
            label: 'Cancel',
            icon: 'close',
            onPress: () => setMenuVisible(false)
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  reelsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 32,
    letterSpacing: 1,
  },
  profileBtn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    color: Colors.light.text,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createBtn: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: Colors.light.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  reelItem: {
    flex: 1,
    width: DEVICE_WIDTH,
    backgroundColor: Colors.light.background,
    position: 'relative',
  },
  mediaContainer: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  fullVideo: {
    width: '100%',
    height: '100%',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  muteBtn: {
    position: 'absolute',
    right: 15,
    bottom:95, // moved even higher for extra clearance
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 20,
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 100,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  followBtn: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  followText: {
    color: Colors.light.text,
    fontSize: 12,
    fontWeight: '600',
  },
  caption: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 8,
  },
  soundInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soundText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 5,
  },
  rightActions: {
    position: 'absolute',
    right: 16,
    bottom: 160, // moved even higher so mute button is not hidden behind tabs
    alignItems: 'center',
    gap: 28,
    zIndex: 10,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionCount: {
    color: '#fff',
    fontSize: 16,
    marginTop: 6,
    fontWeight: 'bold',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  massCoinButton: {
    marginTop: 0, // Adjust as needed to position it correctly
  },
  muteButton: {
    position: 'absolute',
    right: 15,
    bottom: 95, // Adjust position to be above the double-tap heart
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 20,
  },
  doubleTapHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -40 }, { translateY: -40 }], // Center the heart
    zIndex: 10,
  },
});