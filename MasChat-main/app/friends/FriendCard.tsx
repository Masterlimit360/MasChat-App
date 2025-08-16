import { Ionicons } from "@expo/vector-icons";
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

interface Props {
  friend: Friend;
}

export default function FriendCard({ friend }: Props) {
  const router = useRouter();

  const handleMessage = () => {
    router.push({
      pathname: "/screens/ChatScreen",
      params: { recipient: JSON.stringify(friend) }
    });
  };

  const handleViewProfile = () => {
    router.push(`/profile?userId=${friend.id}`);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={handleViewProfile} style={styles.userSection}>
        <Image 
          source={{ uri: friend.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{friend.fullName || friend.username}</Text>
          <Text style={styles.username}>@{friend.username}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.messageButton} onPress={handleMessage}>
          <Ionicons name="chatbubble-outline" size={20} color={COLORS.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.lightText} />
        </TouchableOpacity>
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
  moreButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
});


