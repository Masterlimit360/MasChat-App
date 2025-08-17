import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { StatusBar, ActivityIndicator, FlatList, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, PermissionsAndroid } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { messageService, Message } from '../lib/services/messageService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as ImagePicker from 'expo-image-picker';
import * as Camera from 'expo-camera';
import { Audio } from 'expo-av';
import { uploadImageSimple } from '../lib/services/userService';
import { useTheme } from '../context/ThemeContext';
import { getWebSocketUrl } from '../api/client';
import MassCoinSendButton from '../../components/MassCoinSendButton';

// Modern Color Palette (matching Home screen)
const COLORS = {
  light: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#F8F9FA',  // Light Gray
    card: '#FFFFFF',       // White
    text: '#212529',       // Dark Gray
    lightText: '#6C757D',  // Medium Gray
    border: '#E9ECEF',     // Light Border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    sentMessage: '#4361EE', // Blue for sent messages
    receivedMessage: '#E9ECEF', // Light gray for received messages
  },
  dark: {
    primary: '#4361EE',    // Vibrant Blue
    secondary: '#3A0CA3',  // Deep Purple
    accent: '#FF7F11',     // Orange
    background: '#1A1A2E', // Match marketplace dark background
    card: '#2D2D44',       // Match marketplace dark card
    text: '#FFFFFF',       // White
    lightText: '#B0B0B0',  // Light Gray
    border: '#404040',     // Match marketplace dark border
    success: '#4CC9F0',    // Teal
    dark: '#1A1A2E',       // Dark Blue
    sentMessage: '#4361EE', // Blue for sent messages
    receivedMessage: '#404040', // Dark gray for received messages
  },
};

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  let recipient: any = undefined;
  try {
    recipient = params.recipient ? JSON.parse(params.recipient as string) : null;
  } catch (e) {
    recipient = null;
  }

  if (!currentUser?.id || !recipient?.id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: 'red', fontSize: 18, textAlign: 'center' }}>
          Error: Unable to load chat. User or recipient information is missing or invalid.
        </Text>
      </View>
    );
  }
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pendingMessages = useRef<Message[]>([]);
  const stompClient = useRef<any>(null);
  const [imageSending, setImageSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      // Request camera permission using ImagePicker (which includes camera access)
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus.status === 'granted');

      // Request audio permission
      const audioStatus = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus.status === 'granted');
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  // Deduplicate messages by id before setting state
  const dedupeMessages = (msgs: Message[]) => {
    const seen = new Set();
    return msgs.filter(msg => {
      if (!msg.id || seen.has(msg.id)) return false;
      seen.add(msg.id);
      return true;
    });
  };

  // When loading messages from backend
  const loadMessages = async () => {
    if (isLoading || !currentUser?.id) return;
    setIsLoading(true);
    try {
      const recipientId = recipient?.id || "1";
      const conversation = await messageService.getConversation(currentUser.id, recipientId);
      if (conversation && Array.isArray(conversation)) {
        // Merge with pending messages and remove duplicates
        const allMessages = [...conversation, ...pendingMessages.current];
        const uniqueMessages = allMessages.filter(
          (msg, index, self) => index === self.findIndex(m => m.id === msg.id)
        );
        setMessages(dedupeMessages(uniqueMessages.sort((a, b) => 
          new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()
        )));
      }
    } catch (err) {
      console.log("Error loading messages:", err);
      // If API fails, show pending messages
      setMessages(pendingMessages.current);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    return () => {
      setMessages([]); // Clear messages on unmount
      pendingMessages.current = [];
    };
  }, [recipient?.id]);

  useEffect(() => {
    if (!currentUser?.id || !recipient?.id) return;
      // Connect to WebSocket
      const socket = new SockJS(getWebSocketUrl());
      const client = new Client({
        webSocketFactory: () => socket,
        debug: str => console.log(str),
        onConnect: () => {
          console.log('Chat WebSocket connected successfully');
          client.subscribe(`/user/${currentUser.id}/queue/messages`, message => {
            const msg = JSON.parse(message.body);
            setMessages(prev => {
              if (prev.some(m => m.id === msg.id)) return prev;
              return dedupeMessages([...prev, msg]);
            });
          });
        },
        onStompError: (frame) => {
          console.error('Chat WebSocket STOMP error:', frame);
        },
        onWebSocketError: (error) => {
          console.error('Chat WebSocket error:', error);
        },
        onWebSocketClose: (event) => {
          console.log('Chat WebSocket closed:', event);
        }
      });
      client.activate();
      stompClient.current = client;
      return () => { client.deactivate(); };
  }, [currentUser?.id, recipient?.id]);

  const sendMessage = async () => {
    if (!text.trim() || isSending || !currentUser?.id) return;
    setIsSending(true);
    
    const msg = {
      senderId: currentUser.id,
      recipientId: recipient.id,
      content: text,
      timestamp: new Date().toISOString(),
    };
    
    // Add to pending messages immediately for UI responsiveness
    const pendingMsg: Message = {
      id: msg.timestamp,
      sender: { id: msg.senderId },
      recipient: { id: msg.recipientId },
      content: msg.content,
      sentAt: msg.timestamp,
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isPending: true,
    };
    setMessages(prev => [...prev, pendingMsg]);
    setText('');
    
    try {
      // Send via REST API for persistence
      const savedMessage = await messageService.sendMessage(currentUser.id, recipient.id, text);
      
      // Update the pending message with the saved message
      if (savedMessage) {
        setMessages(prev => prev.map(msg => 
          msg.id === pendingMsg.id ? { 
            ...msg, 
            id: savedMessage.id?.toString() || msg.id,
            sentAt: savedMessage.sentAt,
            isPending: false,
            time: new Date(savedMessage.sentAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          } : msg
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev => prev.map(msg => 
        msg.id === pendingMsg.id ? { ...msg, failed: true, isPending: false } : msg
      ));
    } finally {
      setIsSending(false);
    }
  };

  // Image picker and send logic
  const pickAndSendImage = async () => {
    if (imageSending || !currentUser?.id) return;
    setImageSending(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const uploadedUrl = await uploadImageSimple(imageUri);
        
        if (uploadedUrl) {
          await messageService.sendImageMessage(currentUser.id, recipient.id, uploadedUrl, '');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setImageSending(false);
    }
  };

  const takeAndSendPhoto = async () => {
    if (imageSending || !currentUser?.id) return;
    setImageSending(true);
    try {
      if (!cameraPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const uploadedUrl = await uploadImageSimple(imageUri);
        
        if (uploadedUrl) {
          await messageService.sendImageMessage(currentUser.id, recipient.id, uploadedUrl, '');
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    } finally {
      setImageSending(false);
    }
  };

  const startRecording = async () => {
    if (!currentUser?.id || !audioPermission) {
      Alert.alert('Permission Required', 'Microphone permission is required to record audio');
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);

      if (uri) {
        try {
          // Upload the audio file
          const audioUrl = await uploadImageSimple(uri); // Reusing image upload for now
          
          if (audioUrl) {
            await messageService.sendAudioMessage(currentUser.id, recipient.id, audioUrl, '');
          } else {
            Alert.alert('Error', 'Failed to upload audio recording');
          }
        } catch (uploadError) {
          console.error('Error uploading audio:', uploadError);
          Alert.alert('Error', 'Failed to upload audio recording');
        }
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const handleImagePicker = async () => {
    if (imageSending || !currentUser?.id) return;
    setImageSending(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        const uploadedUrl = await uploadImageSimple(imageUri);
        
        if (uploadedUrl) {
          await messageService.sendImageMessage(currentUser.id, recipient.id, uploadedUrl, '');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setImageSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!currentUser?.id) return;
    
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.deleteMessage(messageId, currentUser.id);
              setMessages(prev => prev.filter(msg => msg.id !== messageId));
            } catch (error) {
              console.error('Error deleting message:', error);
            }
          }
        }
      ]
    );
  };

  const deleteConversation = async () => {
    if (!currentUser?.id) return;
    
    Alert.alert(
      "Delete Conversation",
      "Are you sure you want to delete this entire conversation? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await messageService.deleteConversation(currentUser.id, recipient.id);
              router.back();
            } catch (error) {
              console.error('Error deleting conversation:', error);
            }
          }
        }
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (!item?.sender?.id || !item?.recipient?.id) {
      // Skip rendering this message if sender or recipient is missing
      return null;
    }
    const isSentByMe = item.sender.id === currentUser?.id;
    
    return (
      <TouchableOpacity 
        style={[
          styles.messageRow,
          isSentByMe ? styles.rowRight : styles.rowLeft
        ]}
        onLongPress={() => {
          if (isSentByMe) {
            deleteMessage(item.id);
          }
        }}
      >
        {!isSentByMe && (
          <Image 
            source={{ uri: recipient?.image || recipient?.profilePicture || "https://randomuser.me/api/portraits/men/5.jpg" }} 
            style={styles.bubbleProfilePic} 
          />
        )}
        <View
          style={[
            styles.messageBubble,
            isSentByMe ? styles.sentBubble : styles.receivedBubble,
            item.failed && styles.failedMessage,
            item.isPending && styles.pendingMessage
          ]}
        >
          {item.content && (
            <Text style={[
              styles.messageText,
              isSentByMe ? styles.sentText : styles.receivedText
            ]}>
              {item.content}
            </Text>
          )}
          {item.image && <Image source={{ uri: item.image }} style={styles.messageImage} />}
          {item.audio && (
            <TouchableOpacity style={styles.audioContainer}>
              <Ionicons name="play-circle" size={32} color={isSentByMe ? "#fff" : colors.primary} />
              <Text style={[
                styles.audioText,
                isSentByMe ? styles.sentText : styles.receivedText
              ]}>
                Audio Message
              </Text>
            </TouchableOpacity>
          )}
          <View style={styles.messageStatus}>
            {item.time && (
              <Text style={[
                styles.timeText,
                isSentByMe ? styles.sentTime : styles.receivedTime
              ]}>
                {item.time}
              </Text>
            )}
            {item.failed ? (
              <Ionicons name="warning" size={16} color="#ff4444" style={styles.statusIcon} />
            ) : item.isPending ? (
              <ActivityIndicator size="small" color={isSentByMe ? "#fff" : colors.lightText} style={styles.statusIcon} />
            ) : isSentByMe ? (
              <Ionicons name="checkmark-done" size={16} color="#fff" style={styles.statusIcon} />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack?.()) {
              router.back();
            } else {
              router.replace('/(tabs)/videos');
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerProfile}>
          <View style={styles.profileRing}>
            <Image 
              source={{ uri: recipient?.image || recipient?.profilePicture || "https://randomuser.me/api/portraits/men/5.jpg" }} 
              style={styles.profilePic}
            />
          </View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {recipient?.name || recipient?.username || "Chat"}
          </Text>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="call-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="videocam-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.text }]}>No messages yet</Text>
              <Text style={[styles.emptySubtext, { color: colors.lightText }]}>Send a message to start the conversation</Text>
            </View>
          }
        />
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
            <View style={styles.leftIcons}>
              <TouchableOpacity style={styles.iconBtn} onPress={pickAndSendImage} disabled={imageSending}>
                <Ionicons name="add" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={takeAndSendPhoto} 
                disabled={imageSending || !cameraPermission}
              >
                <Ionicons 
                  name="camera-outline" 
                  size={24} 
                  color={cameraPermission ? colors.primary : colors.lightText} 
                />
              </TouchableOpacity>
              {/* Replace picture button with MassCoin tip button */}
              <View style={{ marginHorizontal: 2 }}>
                <MassCoinSendButton
                  recipientId={recipient.id}
                  recipientName={recipient?.name || recipient?.username || 'User'}
                  contextType="CHAT"
                  contextId={`${currentUser.id}-${recipient.id}`}
                  size="small"
                  variant="icon"
                  style={{ paddingHorizontal: 6, paddingVertical: 4 }}
                />
              </View>
              <TouchableOpacity 
                style={styles.iconBtn} 
                onPress={isRecording ? stopRecording : startRecording}
                disabled={!audioPermission}
              >
                <Ionicons 
                  name={isRecording ? "stop-circle" : "mic-outline"} 
                  size={24} 
                  color={isRecording ? colors.accent : (audioPermission ? colors.primary : colors.lightText)} 
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { 
                height: Math.max(44, inputHeight),
                color: colors.text,
                backgroundColor: colors.background
              }]}
              placeholder="Aa"
              placeholderTextColor={colors.lightText}
              value={text}
              onChangeText={setText}
              multiline
              onContentSizeChange={e => setInputHeight(e.nativeEvent.contentSize.height)}
              editable={!isSending}
            />
            <View style={styles.rightIcons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Ionicons name="happy-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.sendBtn, 
                  text.trim() ? { backgroundColor: colors.primary } : { backgroundColor: colors.lightText }
                ]} 
                onPress={sendMessage}
                disabled={!text.trim() || isSending}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Ionicons name="send" size={20} color="white" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  profileRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4361EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  headerTitle: { 
    fontWeight: '600', 
    fontSize: 16,
  },
  headerActions: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 8,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  messagesContainer: { 
    padding: 16,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  rowLeft: { 
    justifyContent: 'flex-start',
  },
  rowRight: { 
    justifyContent: 'flex-end',
  },
  bubbleProfilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: "#e4e6eb",
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  sentBubble: {
    backgroundColor: '#4361EE',
    borderBottomRightRadius: 4,
  },
  receivedBubble: {
    backgroundColor: '#E9ECEF',
    borderBottomLeftRadius: 4,
  },
  pendingMessage: {
    opacity: 0.8,
  },
  failedMessage: {
    backgroundColor: '#ffebee',
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sentText: {
    color: 'white',
  },
  receivedText: {
    color: '#212529',
  },
  messageImage: {
    width: 200,
    height: 120,
    borderRadius: 12,
    marginTop: 6,
    marginBottom: 4,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  audioText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timeText: {
    fontSize: 12,
  },
  sentTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTime: {
    color: '#6C757D',
  },
  statusIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  leftIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  input: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
    marginHorizontal: 4,
    minHeight: 36,
    maxHeight: 120,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 20,
  },
  sendBtn: {
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
});