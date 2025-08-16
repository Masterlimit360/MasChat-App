import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { friendService } from '../lib/services/friendService';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Suggestion = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

interface Props {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: Props) {
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkRequestStatus = async () => {
      if (!user?.id || user.id === suggestion.id) return;
      try {
        const statusRes = await client.get(`/friends/status?senderId=${user.id}&receiverId=${suggestion.id}`);
        if (statusRes.data.status === 'SENT') {
          setSent(true);
        } else {
          setSent(false);
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
        setSent(false); // Assume not sent if there's an error
      }
    };
    checkRequestStatus();
  }, [user?.id, suggestion.id]);

  const handleSendRequest = async () => {
    if (!user?.id || user.id === suggestion.id) return;
    try {
      await client.post('/friends/request', null, {
        params: {
          senderId: user.id,
          recipientId: suggestion.id
        }
      });
      setSent(true);
      Alert.alert('Success', 'Friend request sent successfully!');
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request. Please try again.');
    }
  };

  const handleCancelRequest = async () => {
    if (!user?.id || user.id === suggestion.id) return;
    try {
      await friendService.cancelFriendRequest(user.id, suggestion.id);
      setSent(false);
      Alert.alert('Success', 'Friend request cancelled.');
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      Alert.alert('Error', 'Failed to cancel friend request. Please try again.');
    }
  };

  const handleViewProfile = () => {
    if (!suggestion?.id) {
      Alert.alert('Error', 'User information is missing.');
      return;
    }
    router.push({
      pathname: "/screens/FriendsProfileScreen",
      params: { userId: suggestion.id }
    });
  };

  const handleMessage = () => {
    if (!suggestion?.id) {
      Alert.alert('Error', 'User information is missing.');
      return;
    }
    const recipient = {
      id: suggestion.id,
      username: suggestion.username,
      name: suggestion.fullName || suggestion.username,
      image: suggestion.profilePicture || '',
      profilePicture: suggestion.profilePicture || '',
      fullName: suggestion.fullName || '',
    };
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(recipient) }
    });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleViewProfile} style={styles.userSection}>
        <Image 
          source={{ uri: suggestion.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{suggestion.fullName || suggestion.username}</Text>
          <Text style={styles.username}>@{suggestion.username}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        {!sent ? (
          <TouchableOpacity 
            style={[styles.addButton, sent && styles.sentButton]} 
            onPress={handleSendRequest}
            disabled={user?.id === suggestion.id}
          >
            <Ionicons name="person-add" size={20} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.addButton, styles.cancelButton]} 
            onPress={handleCancelRequest}
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  username: {
    fontSize: 13,
    color: COLORS.lightText,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  messageButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: COLORS.accent,
  },
  sentButton: {
    backgroundColor: '#22c55e',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
});
