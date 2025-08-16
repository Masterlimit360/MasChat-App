import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getReel, deleteReel } from '../lib/services/reelService';
import { useAuth } from '../context/AuthContext';
// TODO: Replace with expo-video when available in SDK 54
import { Video, ResizeMode } from 'expo-av';

import { Colors } from '../../constants/Colors';

export default function ReelViewerScreen() {
  const router = useRouter();
  const { user } = useAuth() || {};
  const { reelId } = useLocalSearchParams<{ reelId: string }>();
  const [reel, setReel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReelById();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reelId]);

  const fetchReelById = async () => {
    setLoading(true);
    try {
      const r = await getReel(reelId);
      setReel(r);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reel || !user?.id) return;
    Alert.alert('Delete Reel', 'Are you sure you want to delete this reel?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteReel(reel.id, user.id);
        router.back();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.light.primary, '#2B6CD9']}
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
          <Ionicons name="arrow-back" size={24} color={Colors.light.surface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reel</Text>
        {reel && user?.id && user.id === reel.userId ? (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash" size={24} color={Colors.light.accent} />
          </TouchableOpacity>
        ) : <View style={{ width: 36 }} />}
      </LinearGradient>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.light.primary} />
      ) : !reel ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="image-outline" size={60} color={Colors.light.icon} />
          <Text style={styles.emptyText}>Reel not found.</Text>
        </View>
      ) : (
        <View style={styles.postContent}>
          {reel.videoUrl ? (
            <Video
              source={{ uri: reel.videoUrl }}
              style={styles.postVideo}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay
              isLooping
            />
          ) : reel.imageUrl ? (
            <Image source={{ uri: reel.imageUrl }} style={styles.postImage} />
          ) : null}
          <View style={styles.postInfo}>
            <Text style={styles.postUser}>{reel.username}</Text>
            <Text style={styles.postCaption}>{reel.caption}</Text>
            <Text style={styles.postTime}>{new Date(reel.createdAt).toLocaleString()}</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    color: Colors.light.surface,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postContent: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  postVideo: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  postImage: {
    width: '100%',
    height: 320,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#eee',
  },
  postInfo: {
    alignItems: 'center',
  },
  postUser: {
    fontWeight: 'bold',
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  postCaption: {
    fontSize: 15,
    color: Colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  postTime: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: Colors.light.icon,
    fontSize: 16,
    marginTop: 16,
  },
}); 