import { Ionicons } from "@expo/vector-icons";
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, useColorScheme, Platform } from "react-native";
import { useAuth } from '../context/AuthContext';
import { createStory } from '../lib/services/storyService';
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '../lib/services/cloudinaryService';

const COLORS = {
  light: {
    primary: '#3A8EFF',
    accent: '#FF7F11',
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    lightText: '#888888',
    border: '#E9ECEF',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#3A8EFF',
    accent: '#FF7F11',
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',     // Match marketplace dark border
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export default function NewStory() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const [media, setMedia] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setMedia(asset.uri);
      // Map the media type to our supported types
      if (asset.type === 'video' || asset.type === 'pairedVideo') {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }
    if (!media) {
      Alert.alert("Error", "Please select an image or video for your story.");
      return;
    }
    setIsLoading(true);
    try {
      // Upload media to Cloudinary first
      let mediaUrl = media;
      if (!media.startsWith('http')) {
        const folder = 'maschat/stories';
        if (mediaType === 'video') {
          mediaUrl = await uploadVideoToCloudinary(media, folder);
        } else {
          mediaUrl = await uploadImageToCloudinary(media, folder);
        }
      }
      
      await createStory({ mediaUrl, caption }, user.id);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert("Error", "Failed to create story. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // AI image generation
  const generateAIImage = async () => {
    if (!caption.trim()) {
      Alert.alert('Error', 'Please enter a caption to generate an image.');
      return;
    }
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
        body: JSON.stringify({ text: caption }),
      };
      const response = await fetch(url, options);
      const result = await response.json();
      if (result && result.generated_image) {
        setMedia(result.generated_image);
        setMediaType('image');
      } else {
        Alert.alert('Error', 'Failed to generate image.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate image.');
    } finally {
      setAiLoading(false);
    }
  };

    const styles = getStyles(currentColors);
  
  return (
    <View style={styles.container}>
      {/* Custom Header matching Home screen */}
      <BlurView
        intensity={80}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
        style={[styles.header, { backgroundColor: currentColors.tabBarBg, borderBottomColor: currentColors.tabBarBorder }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => {
            if (router.canGoBack?.()) {
              router.back();
            } else {
              router.replace('/(tabs)/home');
            }
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Create Story</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.postButton}>
            <Text style={[styles.postButtonText, { color: currentColors.accent }, isLoading && styles.disabledBtn]}>
              {isLoading ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Media Picker */}
      <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
        {media ? (
          mediaType === 'image' ? <Image source={{ uri: media }} style={styles.mediaPreview} /> :
          mediaType === 'video' ? <Text style={styles.mediaPlaceholderText}>Video selected</Text> :
          mediaType === 'audio' ? <Text style={styles.mediaPlaceholderText}>Audio selected</Text> :
          null
                  ) : (
            <View style={styles.mediaPlaceholder}>
              <Ionicons name="image-outline" size={48} color={currentColors.lightText} />
              <Text style={styles.mediaPlaceholderText}>Tap to select image, video, or audio</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={generateAIImage} style={[styles.mediaPicker, { marginTop: 0, height: 60, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]} disabled={aiLoading}>
          <Ionicons name="sparkles" size={24} color={currentColors.primary} />
          <Text style={{ color: currentColors.primary, fontWeight: 'bold', marginLeft: 8 }}>{aiLoading ? 'Generating...' : 'AI Image'}</Text>
        </TouchableOpacity>

      {/* Caption Input */}
      <TextInput
                  style={styles.captionInput}
          placeholder="Add a caption..."
          placeholderTextColor={currentColors.lightText}
          value={caption}
          onChangeText={setCaption}
        multiline
      />
    </View>
  );
}

const getStyles = (currentColors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    zIndex: 1000,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
  postButton: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
      postButtonText: {
      color: currentColors.accent,
      fontWeight: 'bold',
      fontSize: 16,
    },
  disabledBtn: {
    opacity: 0.5,
  },
  mediaPicker: {
    margin: 24,
    borderRadius: 16,
    backgroundColor: currentColors.card,
    alignItems: 'center',
    justifyContent: 'center',
    height: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mediaPreview: {
    width: '100%',
    height: 260,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  mediaPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 260,
  },
  mediaPlaceholderText: {
    color: currentColors.lightText,
    fontSize: 16,
    marginTop: 12,
  },
  captionInput: {
    backgroundColor: currentColors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: currentColors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});