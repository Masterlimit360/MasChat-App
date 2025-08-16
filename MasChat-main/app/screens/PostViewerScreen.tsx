import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, Share, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getPost, deletePost, Post, likePost, unlikePost } from '../lib/services/postService';
import { useAuth } from '../context/AuthContext';
import { Video, ResizeMode } from 'expo-av';

import { Colors } from '../../constants/Colors';
import ModernHeader from '../components/ModernHeader';

export default function PostViewerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [optimisticLikes, setOptimisticLikes] = useState<string[]>([]);
  const [videoLoading, setVideoLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useEffect(() => {
    if (post && post.likedBy) setOptimisticLikes(post.likedBy.map(String));
  }, [post]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const p = await getPost(postId);
      setPost(p);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (!user) return;
        await deletePost(post.id, user.id);
        router.back();
      }},
    ]);
  };

  const handleLike = async () => {
    if (!user || !post) return;
    const alreadyLiked = optimisticLikes.includes(user.id);
    setOptimisticLikes(prev => alreadyLiked ? prev.filter(id => id !== user.id) : [...prev, user.id]);
    try {
      if (alreadyLiked) {
        await unlikePost(post.id, user.id);
      } else {
        await likePost(post.id, user.id);
      }
    } catch (err) {
      // Optionally revert UI
    }
  };

  const handleOpenComments = () => {
    // Implement comment modal or navigation as needed
    Alert.alert('Comments', 'Open comments modal here.');
  };

  // Helper to share post media
  const handleShareMedia = async () => {
    try {
      const url = post?.videoUrl || post?.imageUrl;
      if (!url) {
        Alert.alert('Nothing to share', 'No media found in this post.');
        return;
      }
      await Share.share({
        message: url,
        url: url,
        title: 'Check out this post on MasChat!'
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share media.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.reelItem, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}> 
        <ActivityIndicator color="#fff" size="large" />
      </View>
    );
  }
  if (!post) {
    return (
      <View style={[styles.reelItem, { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }]}> 
        <Ionicons name="image-outline" size={60} color="#aaa" />
        <Text style={styles.emptyText}>Post not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.reelItem, { backgroundColor: colors.background }]}> 
      <ModernHeader
        title="Posts"
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      {/* Post Media */}
      <View style={styles.postMediaContainer}>
        {post.videoUrl ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {videoLoading && (
              <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', zIndex: 10 }} />
            )}
            <Video
              source={{ uri: post.videoUrl }}
              style={styles.postMedia}
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
              isMuted={true}
              useNativeControls={true}
              onLoadStart={() => setVideoLoading(true)}
              onReadyForDisplay={() => setVideoLoading(false)}
              onError={() => {
                setVideoLoading(false);
                // Silently handle video errors - they're common and not critical
              }}
            />
          </View>
        ) : post.imageUrl ? (
          <Image source={{ uri: post.imageUrl }} style={styles.postMedia} resizeMode="contain" />
        ) : null}
      </View>
      {/* Post Info */}
      <View style={styles.postInfoContainer}>
        <View style={styles.postUserInfo}>
          <Image source={{ uri: post.user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.reelAvatar} />
          <Text style={[styles.reelUsername, { color: '#fff' }]}>{post.user?.username || 'Anonymous'}</Text>
          <TouchableOpacity style={[styles.followButton, { backgroundColor: '#fff' }] }>
            <Text style={[styles.followButtonText, { color: Colors.light.primary }]}>Follow</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.reelCaption, { color: '#fff', fontSize: 18 }]}>{post.content}</Text>
      </View>
      {/* Action Buttons on the right, outline icons, orange for comment count */}
      <View style={styles.tiktokActionBar}>
        <TouchableOpacity style={styles.tiktokActionButton} onPress={handleLike}>
          <Ionicons name={optimisticLikes.includes(user?.id || '') ? 'heart' : 'heart-outline'} size={32} color={optimisticLikes.includes(user?.id || '') ? '#FF3040' : '#fff'} />
          <Text style={[styles.tiktokActionCount, { color: '#fff' }]}>{optimisticLikes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tiktokActionButton} onPress={handleOpenComments}>
          <Ionicons name="chatbubble-outline" size={32} color="#fff" />
          <Text style={[styles.tiktokActionCount, { color: '#fff' }]}>{post.comments?.length || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tiktokActionButton} onPress={handleShareMedia}>
          <Ionicons name="send-outline" size={32} color="#fff" />
          <Text style={[styles.tiktokActionCount, { color: '#fff' }]}>{post.shareCount || 0}</Text>
        </TouchableOpacity>
        {user?.id === post.user?.id && (
          <TouchableOpacity style={styles.tiktokActionButton} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={32} color={Colors.light.accent} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reelItem: {
    width: '100%',
    height: Dimensions.get('window').height,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postMediaContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  postMedia: {
    width: '100%',
    height: '100%',
  },
  postInfoContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 90,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 10,
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  reelAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  reelUsername: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 10,
  },
  followButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  followButtonText: {
    color: Colors.light.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  reelCaption: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  tiktokActionBar: {
    position: 'absolute',
    right: 20,
    top: '35%',
    zIndex: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tiktokActionButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tiktokActionCount: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 16,
  },
});

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