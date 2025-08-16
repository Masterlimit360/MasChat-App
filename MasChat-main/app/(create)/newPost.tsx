import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
} from "react-native";
import { useAuth } from '../context/AuthContext';
import { createPost } from '../lib/services/postService';
import { uploadImageToCloudinary, uploadVideoToCloudinary } from '../lib/services/cloudinaryService';
import { BlurView } from 'expo-blur';

// Color Palette (matching home/friends screens)
const COLORS = {
  light: {
    primary: '#3A8EFF',  // Deep Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#F5F7FA',
    card: '#FFFFFF',
    text: '#333333',
    lightText: '#888888',
    border: '#E9ECEF',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#3A8EFF',  // Deep Blue
    accent: '#FF7F11',   // Vibrant Orange
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',     // Match marketplace dark border
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};



export default function NewPost() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const currentColors = colorScheme === 'dark' ? COLORS.dark : COLORS.light;
  const [post, setPost] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [audio, setAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      console.log('Selected media asset:', asset);
      console.log('Asset type:', asset.type);
      console.log('Asset URI:', asset.uri);
      
      // Clear previous media
      setImage(null);
      setVideo(null);
      setMediaType(null);
      
      if (asset.type === 'video' || asset.type === 'pairedVideo') {
        setVideo(asset.uri);
        setMediaType('video');
        console.log('Set as video:', asset.uri);
      } else if (asset.type === 'image' || asset.type === 'livePhoto') {
        setImage(asset.uri);
        setMediaType('image');
        console.log('Set as image:', asset.uri);
      } else {
        // Default to image if type is unknown
        setImage(asset.uri);
        setMediaType('image');
        console.log('Set as image (default):', asset.uri);
      }
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }
    if (!post.trim() && !image && !video) {
      Alert.alert("Error", "Post cannot be empty");
      return;
    }
    setIsLoading(true);
    try {
      let imageUrl = null;
      let videoUrl = null;
      
      // Handle any image (picked or AI-generated)
      if (image) {
        // Upload image to Cloudinary
        const folder = 'maschat/posts';
        console.log('Uploading image to Cloudinary:', image);
        imageUrl = await uploadImageToCloudinary(image, folder);
        console.log('Image uploaded successfully:', imageUrl);
      }
      
      // Handle video
      if (video && mediaType === 'video') {
        // Upload video to Cloudinary
        const folder = 'maschat/posts/videos';
        console.log('Uploading video to Cloudinary:', video);
        videoUrl = await uploadVideoToCloudinary(video, folder);
        console.log('Video uploaded successfully:', videoUrl);
      }
      
      await createPost({
        content: post,
        imageUrl: imageUrl || undefined,
        videoUrl: videoUrl || undefined,
      }, user.id);
      router.back();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert("Error", "Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // AI image generation
  const generateAIImage = async () => {
    if (!post.trim()) {
      Alert.alert('Error', 'Please enter some text to generate an image.');
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
        body: JSON.stringify({ text: post }),
      };
      const response = await fetch(url, options);
      const result = await response.json();
      console.log(result);
      if (result && result.generated_image) {
        setImage(result.generated_image);
        setMediaType('image'); // Set mediaType to 'image' for AI-generated images
        setVideo(null); // Clear any video selection
      } else {
        Alert.alert('Error', 'Failed to generate image.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate image.');
    } finally {
      setAiLoading(false);
    }
  };

  if (!user) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>User not found</Text></View>;
  }

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
          <Text style={[styles.headerTitle, { color: currentColors.text }]}>Create Post</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isLoading} style={styles.postButton}>
            <Text style={[styles.postButtonText, { color: currentColors.accent }, isLoading && styles.disabledBtn]}>
              {isLoading ? "Posting..." : "Post"}
            </Text>
          </TouchableOpacity>
        </View>
      </BlurView>

      {/* Media Picker */}
      <TouchableOpacity style={styles.mediaPicker} onPress={pickMedia}>
        {(image || video) ? (
          image ? <Image source={{ uri: image }} style={styles.mediaPreview} /> :
          video ? <Text style={styles.mediaPlaceholderText}>Video selected</Text> :
          null
        ) : (
          <View style={styles.mediaPlaceholder}>
            <Ionicons name="image-outline" size={48} color={currentColors.lightText} />
            <Text style={styles.mediaPlaceholderText}>Tap to select image or video</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity onPress={generateAIImage} style={[styles.mediaPicker, { marginTop: 0, height: 60, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }]} disabled={aiLoading}>
        <Ionicons name="sparkles" size={24} color={currentColors.primary} />
        <Text style={{ color: currentColors.primary, fontWeight: 'bold', marginLeft: 8 }}>{aiLoading ? 'Generating...' : 'AI Image'}</Text>
      </TouchableOpacity>

      {/* Post Input */}
      <TextInput
        style={styles.captionInput}
        placeholder="What's on your mind?"
        placeholderTextColor={currentColors.lightText}
        multiline
        value={post}
        onChangeText={setPost}
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
    color: COLORS.light.accent,
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
  },
  mediaPlaceholderText: {
    color: currentColors.lightText,
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  captionInput: {
    margin: 24,
    padding: 16,
    backgroundColor: currentColors.card,
    borderRadius: 12,
    fontSize: 16,
    color: currentColors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 8,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#f0f2f5',
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: currentColors.text,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fd',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
  },
  chipText: {
    color: currentColors.primary,
    fontSize: 13,
    marginHorizontal: 3,
    fontWeight: '500',
  },
  input: {
    backgroundColor: currentColors.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    color: currentColors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e7f0fd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
  },
  pickButtonText: {
    color: currentColors.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginLeft: 8,
  },
  previewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  previewText: {
    color: currentColors.lightText,
    fontSize: 16,
  },
  optionsSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 8,
    paddingBottom: 24,
    paddingHorizontal: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
  },
  optionsHandle: {
    alignSelf: "center",
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionLabel: {
    fontSize: 16,
    color: "#222",
    marginLeft: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optionText: {
    fontSize: 16,
    color: "#222",
    marginLeft: 16,
  },
});