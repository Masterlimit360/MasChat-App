import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
  Alert
} from 'react-native';
import { useAuth } from '../app/context/AuthContext';
import { aiChatService, AIChat, AIChatMessage } from '../app/lib/services/aiChatService';

const { height } = Dimensions.get('window');

// Color Palette (matching app design)
const COLORS = {
  primary: '#3A8EFF',  // New Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  gradient1: ['#3A8EFF', '#2B6CD9'] as const,
  gradient2: ['#4facfe', '#00f2fe'] as const,
  gradient3: ['#fff', '#f8f9fa'] as const,
};

type Message = { 
  text: string; 
  isUser: boolean;
  time: string;
  id: string;
};

type AIChatModalProps = { visible: boolean; onClose: () => void };

export default function AIChatModal({ visible, onClose }: AIChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat session when modal opens
  useEffect(() => {
    if (visible && user?.id && !currentSessionId) {
      initializeChat();
    }
  }, [visible, user?.id]);

  const initializeChat = async () => {
    if (!user?.id) {
      Alert.alert('Authentication Required', 'Please log in to use AI Chat.');
      onClose();
      return;
    }
    
    setIsInitializing(true);
    try {
      console.log('Initializing AI chat for user:', user.id);
      // Create new chat session
      const newChat = await aiChatService.createNewChat(user.id);
      console.log('AI chat created successfully:', newChat);
      setCurrentSessionId(newChat.sessionId);
      
      // Convert backend messages to frontend format
      const frontendMessages: Message[] = newChat.messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        isUser: msg.isUserMessage,
        time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setMessages(frontendMessages);
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        userId: user.id
      });
      
      let errorMessage = 'Failed to initialize AI chat. Please try again.';
      if (error.response?.data?.message) {
        errorMessage += `\n\nDetails: ${error.response.data.message}`;
      }
      
      Alert.alert('Error', errorMessage);
      onClose();
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !user?.id || !currentSessionId) {
      if (!user?.id) {
        Alert.alert('Authentication Required', 'Please log in to use AI Chat.');
        onClose();
      }
      return;
    }
    
    const userMessage = inputText.trim();
    const newMessage: Message = {
      id: Date.now().toString(),
      text: userMessage,
      isUser: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Send message to backend
      const updatedChat = await aiChatService.sendMessage(user.id, currentSessionId, userMessage);
      
      // Update messages with the complete conversation
      const frontendMessages: Message[] = updatedChat.messages.map(msg => ({
        id: msg.id.toString(),
        text: msg.content,
        isUser: msg.isUserMessage,
        time: new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      
      setMessages(frontendMessages);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
      
      // Remove the user message if it failed
      setMessages(prev => prev.filter(msg => msg.id !== newMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputText('');
    setCurrentSessionId(null);
    setIsLoading(false);
    setIsInitializing(false);
    onClose();
  };

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  // Debug function to test database
  const testDatabase = async () => {
    try {
      console.log('Testing database connection...');
      const result = await aiChatService.testDatabase();
      console.log('Database test result:', result);
      Alert.alert('Database Test', `Status: ${result.status}\nUsers: ${result.userCount}\nAI Chats: ${result.aiChatCount}\nAI Messages: ${result.aiMessageCount}`);
    } catch (error: any) {
      console.error('Database test failed:', error);
      Alert.alert('Database Test Failed', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Debug function to initialize database
  const initializeDatabase = async () => {
    try {
      console.log('Initializing database...');
      const result = await aiChatService.initializeDatabase();
      console.log('Database initialization result:', result);
      Alert.alert('Database Initialization', `Status: ${result.status}\nMessage: ${result.message}`);
    } catch (error: any) {
      console.error('Database initialization failed:', error);
      Alert.alert('Database Initialization Failed', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isInitializing) {
    return (
      <Modal visible={visible} animationType="slide" transparent={false}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" translucent={false} />
        <View style={[styles.container, styles.centerContent]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Initializing AI Chat...</Text>
          <TouchableOpacity style={styles.debugButton} onPress={testDatabase}>
            <Text style={styles.debugButtonText}>Test Database</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.debugButton} onPress={initializeDatabase}>
            <Text style={styles.debugButtonText}>Initialize DB</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      onRequestClose={handleClose}
      transparent={false}
      statusBarTranslucent={false}
    >
      <StatusBar 
        backgroundColor={COLORS.primary} 
        barStyle="light-content" 
        translucent={false}
      />
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={COLORS.gradient1}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                size={24}
                color={COLORS.white}
              />
            </TouchableOpacity>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={[COLORS.accent, '#FF9F4A']}
                style={styles.avatarGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="sparkles" size={20} color={COLORS.white} />
              </LinearGradient>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>MasChat AI</Text>
              <Text style={styles.subtitle}>
                {isLoading ? 'Typing...' : 'Online'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Chat Content */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.chatContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView 
            ref={scrollViewRef}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageContainer,
                  msg.isUser ? styles.userContainer : styles.aiContainer
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.aiAvatarContainer}>
                    <LinearGradient
                      colors={[COLORS.accent, '#FF9F4A']}
                      style={styles.aiAvatar}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="sparkles" size={16} color={COLORS.white} />
                    </LinearGradient>
                  </View>
                )}
                <LinearGradient
                  colors={msg.isUser ? COLORS.gradient2 : COLORS.gradient3}
                  style={[
                    styles.messageBubble,
                    msg.isUser ? styles.userBubble : styles.aiBubble,
                    Platform.OS === 'android' ? styles.androidMessageShadow : styles.iosMessageShadow
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={msg.isUser ? styles.userText : styles.aiText}>
                    {msg.text}
                  </Text>
                  <Text style={[
                    styles.timeText,
                    msg.isUser ? styles.userTime : styles.aiTime
                  ]}>
                    {msg.time}
                  </Text>
                </LinearGradient>
              </View>
            ))}
            {isLoading && (
              <View style={styles.typingContainer}>
                <View style={[
                  styles.typingBubble,
                  Platform.OS === 'android' ? styles.androidMessageShadow : styles.iosMessageShadow
                ]}>
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                  <View style={styles.typingDot} />
                </View>
              </View>
            )}
          </ScrollView>
          
          {/* Input Area */}
          <View style={[
            styles.inputContainer,
            Platform.OS === 'android' ? styles.androidInputShadow : styles.iosInputShadow
          ]}>
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.attachmentButton}>
                <MaterialCommunityIcons name="attachment" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Message MasChat AI..."
                placeholderTextColor={COLORS.lightText}
                multiline
                onSubmitEditing={handleSend}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !inputText.trim() && styles.sendButtonDisabled,
                  isLoading && styles.sendButtonLoading
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Ionicons 
                    name="send" 
                    size={20} 
                    color={inputText.trim() ? COLORS.white : COLORS.lightText} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  aiAvatarContainer: {
    marginRight: 8,
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium'
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  userContainer: {
    justifyContent: 'flex-end',
  },
  aiContainer: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
  },
  iosMessageShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  androidMessageShadow: {
    elevation: 2,
  },
  userBubble: {
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    borderBottomLeftRadius: 6,
  },
  userText: {
    color: COLORS.white,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  aiText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  timeText: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  userTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  aiTime: {
    color: COLORS.lightText,
  },
  typingContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingLeft: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginHorizontal: 2,
  },
  inputContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  },
  iosInputShadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  androidInputShadow: {
    elevation: 3,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  attachmentButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif'
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#b0c4de',
  },
  sendButtonLoading: {
    opacity: 0.8,
  },
  debugButton: {
    marginTop: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  debugButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});