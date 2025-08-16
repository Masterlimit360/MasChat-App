import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getPosts, Post } from '../lib/services/postService';
import { Video } from 'expo-av';

export default function Posts() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const [videoError, setVideoError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  useEffect(() => {
    getPosts().then((data: Post[]) => {
      setPosts(data);
      setLoading(false);
      if (postId) {
        const idx = data.findIndex((p: Post) => p.id === postId);
        if (idx !== -1) {
          setCurrentIndex(idx);
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: idx * Dimensions.get('window').height, animated: false });
          }, 100);
        }
      }
    });
  }, [postId]);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const height = Dimensions.get('window').height;
    const newIndex = Math.round(offsetY / height);
    setCurrentIndex(newIndex);
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}><ActivityIndicator size="large" color="#fff" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <ScrollView
        ref={scrollRef}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {posts.map((post, idx) => (
          <View key={post.id} style={{ width: '100%', height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
            {post.videoUrl ? (
              <View style={{ width: '100%', height: 320, justifyContent: 'center', alignItems: 'center' }}>
                {videoLoading && <ActivityIndicator size="large" color="#fff" style={{ position: 'absolute', top: 140, left: '50%' }} />}
                {videoError ? (
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Video failed to load.</Text>
                ) : (
                  <Video
                    source={{ uri: post.videoUrl }}
                    style={{ width: '100%', height: 320 }}
                    resizeMode={require('expo-av').ResizeMode.COVER}
                    shouldPlay={idx === currentIndex}
                    isLooping
                    isMuted={false}
                    rate={1.0}
                    volume={1.0}
                    progressUpdateIntervalMillis={250}
                    onError={() => setVideoError(true)}
                    onLoadStart={() => { setVideoLoading(true); setVideoError(false); }}
                    onReadyForDisplay={() => setVideoLoading(false)}
                  />
                )}
              </View>
            ) : post.imageUrl ? (
              <Image source={{ uri: post.imageUrl }} style={{ width: '100%', height: 320 }} />
            ) : null}
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{post.user?.username || ''}</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>{post.content}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 