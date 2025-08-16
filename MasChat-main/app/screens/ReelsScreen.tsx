import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { fetchReels, deleteReel, Reel, likeReel, unlikeReel, addReelComment, shareReel, getReelComments, ReelComment } from '../lib/services/reelService';
import { Video, ResizeMode } from 'expo-av';
import CommentDialog from "../components/CommentDialog";

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

const LIKE_ACTIVE_COLOR = '#22c55e'; // Green
const LIKE_INACTIVE_COLOR = COLORS.lightText;
const { height: DEVICE_HEIGHT, width: DEVICE_WIDTH } = Dimensions.get('window');

export default function ReelsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentModalReel, setCommentModalReel] = useState<Reel | null>(null);
  const [optimisticLikes, setOptimisticLikes] = useState<{ [reelId: string]: string[] }>({});
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const reelsScrollRef = useRef<ScrollView>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchAllReels();
  }, []);

  const fetchAllReels = async () => {
    setLoading(true);
    try {
      const data = await fetchReels();
      setReels(data);
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
        fetchAllReels();
      }},
    ]);
  };

  const handleLikeReel = async (reel: Reel) => {
    if (!user || typeof user.id !== 'string' || !user.id) return;
    const alreadyLiked = (optimisticLikes[reel.id] || reel.likedBy || []).includes(user.id);
    setOptimisticLikes(prev => ({
      ...prev,
      [reel.id]: alreadyLiked
        ? (prev[reel.id] || reel.likedBy || []).filter(id => id !== user.id)
        : [...(prev[reel.id] || reel.likedBy || []), user.id]
    }));
    if (alreadyLiked) {
      await unlikeReel(reel.id, user.id as string);
    } else {
      await likeReel(reel.id, user.id as string);
    }
    fetchAllReels();
  };

  const handleShare = async (reelId: string) => {
    await shareReel(reelId);
    fetchAllReels();
  };

  const handleReelScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const newIndex = Math.round(offsetY / DEVICE_HEIGHT);
    setCurrentReelIndex(newIndex);
  };

  // Get the current reel for header actions
  const currentReel = reels[currentReelIndex] || null;

  // AI image generation for new reel
  const generateAIReelImage = async () => {
    Alert.prompt('AI Reel Image', 'Describe the image for your reel:', async (prompt) => {
      if (!prompt) return;
      setAiLoading(true);
      try {
        const url = 'https://open-ai21.p.rapidapi.com/texttoimage2';
        const options = {
          method: 'POST',
          headers: {
            'x-rapidapi-key': '355060685fmsh742abd58eb438d7p1f4d66jsn22cd506769c9',
            'x-rapidapi-host': 'open-ai21.p.rapidapi.com',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: prompt }),
        };
        const response = await fetch(url, options);
        const result = await response.json();
        if (result && result.generated_image) {
          router.push({ pathname: '/(create)/newReel', params: { aiImage: result.generated_image } });
        } else {
          Alert.alert('Error', 'Failed to generate image.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to generate image.');
      } finally {
        setAiLoading(false);
      }
    });
  };

  return (
    <View style={styles.container}>
      {/* Header (updates for current reel) */}
      <LinearGradient
        colors={[COLORS.primary, '#2B6CD9']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <TouchableOpacity onPress={() => {
          if (router.canGoBack?.()) {
            router.back();
          } else {
            router.replace('/(tabs)/videos');
          }
        }} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reel</Text>
        {currentReel && user?.id === currentReel.userId ? (
          <TouchableOpacity onPress={() => handleDelete(currentReel.id)} style={styles.deleteBtn}>
            <Ionicons name="trash" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </LinearGradient>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={COLORS.primary} />
      ) : reels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>No reels yet.</Text>
          <TouchableOpacity style={styles.createBtn} onPress={() => router.push('/(create)/newReel')}>
            <Text style={styles.createBtnText}>Create New Reel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBtn} onPress={generateAIReelImage} disabled={aiLoading}>
            <Ionicons name="sparkles" size={24} color={COLORS.accent} />
            <Text style={styles.createBtnText}>{aiLoading ? 'Generating...' : 'AI Reel'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={reelsScrollRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleReelScroll}
          scrollEventThrottle={16}
        >
          {reels.map((reel, index) => (
            <View key={reel.id} style={[styles.reelItem, { height: DEVICE_HEIGHT }]}> 
              <View style={styles.mediaContainer}>
                {reel.mediaUrl && reel.mediaUrl.endsWith('.mp4') ? (
                  <Video
                    source={{ uri: reel.mediaUrl }}
                    style={styles.fullVideo}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay={index === currentReelIndex}
                    isLooping
                    useNativeControls
                    onError={(error) => {
                      // Silently handle video errors - they're common and not critical
                      // console.error('Reel video error:', error);
                    }}
                  />
                ) : reel.mediaUrl ? (
                  <Image source={{ uri: reel.mediaUrl }} style={styles.fullImage} resizeMode="contain" />
                ) : null}
              </View>
              <View style={styles.infoOverlay}>
                <Text style={styles.username}>{reel.username}</Text>
                <Text style={styles.caption}>{reel.caption}</Text>
                <Text style={styles.time}>{new Date(reel.createdAt).toLocaleString()}</Text>
                
                {/* Like and Comment Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.likeCountContainer}>
                    <Ionicons name="heart" size={16} color={LIKE_ACTIVE_COLOR} />
                    <Text style={styles.likeCountText}>
                      {reel.likeCount || (optimisticLikes[reel.id] || reel.likedBy || []).length}
                    </Text>
                  </View>
                  <Text style={styles.commentCountText}>
                    {reel.commentCount || 0} comments • {reel.shareCount || 0} shares
                  </Text>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => user && handleLikeReel(reel)}
                  >
                    <Ionicons
                      name={(optimisticLikes[reel.id] || reel.likedBy || []).includes(user?.id || '') ? 'heart' : 'heart-outline'}
                      size={24}
                      color={(optimisticLikes[reel.id] || reel.likedBy || []).includes(user?.id || '') ? LIKE_ACTIVE_COLOR : LIKE_INACTIVE_COLOR}
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setCommentModalReel(reel)}
                  >
                    <Ionicons 
                      name="chatbubble-outline" 
                      size={22} 
                      color={LIKE_INACTIVE_COLOR} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleShare(reel.id)}
                  >
                    <Ionicons 
                      name="arrow-redo-outline" 
                      size={24} 
                      color={LIKE_INACTIVE_COLOR} 
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
      {commentModalReel && user?.id && (
        <CommentDialog
          postId={commentModalReel.id}
          userId={user.id}
          onClose={() => setCommentModalReel(null)}
          onComment={fetchAllReels}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: COLORS.lightText,
    fontSize: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  createBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  reelItem: {
    flex: 1,
    width: DEVICE_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  mediaContainer: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT * 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  fullVideo: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT * 0.6,
    backgroundColor: '#eee',
  },
  fullImage: {
    width: DEVICE_WIDTH,
    height: DEVICE_HEIGHT * 0.6,
    backgroundColor: '#eee',
    borderRadius: 16,
  },
  infoOverlay: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 4,
  },
  caption: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  time: {
    fontSize: 13,
    color: COLORS.lightText,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 12,
    marginBottom: 16,
  },
  likeCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 4,
  },
  commentCountText: {
    fontSize: 14,
    color: COLORS.lightText,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
  },
}); 