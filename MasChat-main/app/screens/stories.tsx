import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Dimensions, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { fetchStories, Story } from '../lib/services/storyService';

export default function Stories() {
  const { storyId } = useLocalSearchParams<{ storyId: string }>();
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    fetchStories().then(data => {
      setStories(data);
      setLoading(false);
      if (storyId) {
        const idx = data.findIndex(s => s.id === storyId);
        if (idx !== -1) {
          setCurrentIndex(idx);
          setTimeout(() => {
            scrollRef.current?.scrollTo({ y: idx * Dimensions.get('window').height, animated: false });
          }, 100);
        }
      }
    });
  }, [storyId]);

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
        {stories.map((story, idx) => (
          <View key={story.id} style={{ width: '100%', height: Dimensions.get('window').height, justifyContent: 'center', alignItems: 'center' }}>
            <Image source={{ uri: story.mediaUrl }} style={{ width: '100%', height: 320 }} />
            <View style={{ marginBottom: 40, alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>{story.username || ''}</Text>
              <Text style={{ color: '#fff', fontSize: 16 }}>{story.caption || ''}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
} 