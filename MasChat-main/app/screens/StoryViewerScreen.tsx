import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, Image, TouchableOpacity, StyleSheet, 
  Dimensions, Modal, Animated, Easing, Platform, TextInput 
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Story, fetchStoriesByUser, deleteStory } from '../lib/services/storyService';
import { formatDistanceToNow } from 'date-fns';
import { BlurView } from 'expo-blur';
import { PanResponder } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const STORY_DURATION = 5000; // 5 seconds per story

export default function StoryViewerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const targetUserId = params.userId as string; // Get the target user ID from params
  
  console.log('StoryViewerScreen - Current user ID:', user?.id);
  console.log('StoryViewerScreen - Target user ID:', targetUserId);
  console.log('StoryViewerScreen - Is own story:', user?.id === targetUserId);
  
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [storyUser, setStoryUser] = useState<any>(null); // Store the story user info
  const progressAnim = useRef(new Animated.Value(0)).current;
  const videoRef = useRef<Video>(null);
  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.mediaUrl?.endsWith('.mp4') || currentStory?.mediaUrl?.endsWith('.mov');
  
  // Check if viewing own stories or someone else's
  const isOwnStory = user?.id === targetUserId;
  
  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (_, gestureState) => {
        const { dx, dy } = gestureState;
        
        // Swipe down to close
        if (dy > 50) {
          router.back();
          return;
        }
        
        // Swipe right for previous story
        if (dx > 50) {
          goToPrevious();
          return;
        }
        
        // Swipe left for next story
        if (dx < -50) {
          goToNext();
          return;
        }
      }
    })
  ).current;

  useEffect(() => {
    if (targetUserId) {
      fetchStories();
    }
  }, [targetUserId]);

  useEffect(() => {
    if (stories.length > 0) {
      startProgressAnimation();
    }
    return () => progressAnim.stopAnimation();
  }, [stories, currentIndex]);

  const fetchStories = async () => {
    try {
      console.log('Fetching stories for user:', targetUserId);
      const userStories = await fetchStoriesByUser(targetUserId);
      setStories(userStories);
      
      // If we have stories, get the user info from the first story
      if (userStories.length > 0) {
        setStoryUser({
          id: userStories[0].userId,
          username: userStories[0].username,
          profilePicture: userStories[0].profilePicture
        });
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    }
  };

  const startProgressAnimation = () => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) goToNext();
    });
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      router.back();
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleDelete = async (storyId: string) => {
    if (!user?.id) return;
    await deleteStory(storyId, user.id);
    fetchStories();
  };

  const togglePause = () => {
    setPaused(!paused);
    if (paused) {
      startProgressAnimation();
    } else {
      progressAnim.stopAnimation();
    }
  };

  if (stories.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stories available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      {/* Progress bars */}
      <View style={styles.progressBarContainer}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBackground}>
            {index === currentIndex && (
              <Animated.View style={[
                styles.progressBarFill,
                { width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })}
              ]}/>
            )}
          </View>
        ))}
      </View>
      
      {/* Story content */}
      {isVideo ? (
        <Video
          ref={videoRef}
          source={{ uri: currentStory.mediaUrl }}
          style={styles.media}
          resizeMode={ResizeMode.COVER}
          shouldPlay={!paused}
          isLooping={false}
          onPlaybackStatusUpdate={status => {
            if (status.isLoaded && status.didJustFinish) {
              goToNext();
            }
          }}
        />
      ) : (
        <Image source={{ uri: currentStory.mediaUrl }} style={styles.media} />
      )}
      
      {/* Header */}
      <BlurView intensity={80} style={styles.header}>
        <View style={styles.userInfo}>
          <Image
            source={{ uri: storyUser?.profilePicture || currentStory?.profilePicture || 'https://i.imgur.com/6XbK6bE.jpg' }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.username}>{storyUser?.username || currentStory?.username}</Text>
            <Text style={styles.timestamp}>
              {formatDistanceToNow(new Date(currentStory.createdAt), { addSuffix: true })}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          {isOwnStory && (
            <TouchableOpacity
              onPress={() => handleDelete(currentStory.id)}
              style={styles.deleteButton}
            >
              <Ionicons name="trash-outline" size={24} color="white" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={togglePause} style={styles.pauseButton}>
            <Ionicons name={paused ? "play" : "pause"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </BlurView>
      
      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        <View style={styles.reactionContainer}>
          {['heart', 'happy', 'sad', 'heart-dislike', 'thumbs-up', 'chatbubble'].map((icon, index) => (
            <TouchableOpacity key={index} style={styles.reactionButton}>
              <Ionicons 
                name={icon as any} 
                size={28} 
                color="white" 
                style={styles.reactionIcon}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.messageContainer}>
          <TextInput
            placeholder="Send message"
            placeholderTextColor="rgba(255,255,255,0.7)"
            style={styles.messageInput}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Gesture overlays */}
      <TouchableOpacity 
        style={[styles.gestureArea, { left: 0 }]} 
        onPress={goToPrevious}
      />
      <TouchableOpacity 
        style={[styles.gestureArea, { right: 0 }]} 
        onPress={goToNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: Platform.OS === 'ios' ? 48 : 24,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 2,
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'white',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 48 : 24,
    left: 0,
    right: 0,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 16,
  },
  deleteButton: {
    marginLeft: 16,
  },
  pauseButton: {
    marginLeft: 16,
  },
  closeButton: {
    marginLeft: 16,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 10,
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  reactionButton: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 24,
    padding: 8,
  },
  reactionIcon: {
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  messageInput: {
    flex: 1,
    color: 'white',
    height: 48,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
  },
  gestureArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH / 3,
    zIndex: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
  },
}); 