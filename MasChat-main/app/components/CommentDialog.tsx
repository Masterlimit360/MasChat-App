import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Image, 
  Alert,
  ScrollView,
  Dimensions,
  LayoutAnimation
} from "react-native";
import Modal from "react-native-modal";
import { addComment, addReply, fetchPostComments, likeComment, unlikeComment } from "../lib/services/postService";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CommentDialogProps {
  postId: string;
  userId: string;
  onClose: () => void;
  onComment: () => void;
  postOwnerId?: string;
  postOwnerName?: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  content: string;
  createdAt: string;
  parentCommentId?: string;
  replies?: Comment[];
  likeCount: number;
  replyCount: number;
  isLikedByCurrentUser: boolean;
  timeAgo: string;
}

const EMOJI_REACTIONS = ['😂', '😭', '💀', '🤣', '😢', '🥰', '😊', '😂'];

export default function CommentDialog({ 
  postId, 
  userId, 
  onClose, 
  onComment, 
  postOwnerId, 
  postOwnerName = "" 
}: CommentDialogProps) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [showReplies, setShowReplies] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const inputRef = useRef<TextInput>(null);
  const flatListRef = useRef<FlatList>(null);

  const colors = {
    light: {
      background: '#FFFFFF',
      card: '#F8F9FA',
      text: '#212529',
      lightText: '#6C757D',
      border: '#E9ECEF',
      primary: '#4361EE',
      accent: '#FF7F11',
    },
    dark: {
      background: '#1A1A2E',
      card: '#2D2D44',
      text: '#FFFFFF',
      lightText: '#B0B0B0',
      border: '#404040',
      primary: '#4361EE',
      accent: '#FF7F11',
    }
  }[currentTheme === 'dark' ? 'dark' : 'light'];

  const loadComments = async () => {
    setRefreshing(true);
    try {
      const data = await fetchPostComments(postId, user?.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleComment = async () => {
    if (!comment.trim()) return;
    
    setLoading(true);
    try {
      if (replyingTo) {
        await addReply(postId, userId, replyingTo.id, comment);
        setReplyingTo(null);
      } else {
        await addComment(postId, userId, comment);
      }
      setComment("");
      await loadComments();
      onComment();
      
      // Scroll to bottom after adding comment
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      // Optimistic update
      setComments(prev => prev.map(c => {
        if (c.id === commentId) {
          return {
            ...c,
            likeCount: c.isLikedByCurrentUser ? c.likeCount - 1 : c.likeCount + 1,
            isLikedByCurrentUser: !c.isLikedByCurrentUser
          };
        }
        return c;
      }));

      // API call
      const comment = comments.find(c => c.id === commentId);
      if (comment) {
        if (comment.isLikedByCurrentUser) {
          await unlikeComment(commentId, userId);
        } else {
          await likeComment(commentId, userId);
        }
      }
    } catch (error) {
      console.error('Error liking comment:', error);
      // Revert optimistic update on error
      await loadComments();
    }
  };

  const handleReply = (comment: Comment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const toggleReplies = (commentId: string) => {
    setShowReplies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const toggleEmojiPicker = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowEmojiPicker(prev => !prev);
  };

  const filteredComments = searchTerm 
    ? comments.filter(c => 
        c.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : comments;

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={[styles.commentItem, { backgroundColor: colors.card }]}>
      <View style={styles.commentHeader}>
        <Image 
          source={{ uri: item.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
          style={styles.profilePhoto} 
        />
        <View style={styles.commentInfo}>
          <Text style={[styles.commentUser, { color: colors.text }]}>{item.username}</Text>
          <Text style={[styles.commentTime, { color: colors.lightText }]}>{item.timeAgo}</Text>
        </View>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={() => handleLikeComment(item.id)}
          >
            <Ionicons 
              name={item.isLikedByCurrentUser ? "heart" : "heart-outline"} 
              size={16} 
              color={item.isLikedByCurrentUser ? "#FF3040" : colors.lightText} 
            />
            <Text style={[styles.likeCount, { color: colors.lightText }]}>{item.likeCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.commentText, { color: colors.text }]}>{item.content}</Text>
      
      <View style={styles.commentFooter}>
        <TouchableOpacity onPress={() => handleReply(item)}>
          <Text style={[styles.replyButton, { color: colors.lightText }]}>Reply</Text>
        </TouchableOpacity>
        
        {item.replyCount > 0 && (
          <TouchableOpacity onPress={() => toggleReplies(item.id)}>
            <Text style={[styles.viewRepliesButton, { color: colors.lightText }]}>
              View {item.replyCount} more replies
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showReplies.has(item.id) && item.replies && item.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {item.replies.map((reply) => (
            <View key={reply.id} style={[styles.replyItem, { backgroundColor: colors.background }]}>
              <View style={styles.replyHeader}>
                <Image 
                  source={{ uri: reply.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                  style={styles.replyProfilePhoto} 
                />
                <View style={styles.replyInfo}>
                  <Text style={[styles.replyUser, { color: colors.text }]}>{reply.username}</Text>
                  <Text style={[styles.replyTime, { color: colors.lightText }]}>{reply.timeAgo}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.likeButton} 
                  onPress={() => handleLikeComment(reply.id)}
                >
                  <Ionicons 
                    name={reply.isLikedByCurrentUser ? "heart" : "heart-outline"} 
                    size={14} 
                    color={reply.isLikedByCurrentUser ? "#FF3040" : colors.lightText} 
                  />
                  <Text style={[styles.likeCount, { color: colors.lightText, fontSize: 12 }]}>{reply.likeCount}</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.replyText, { color: colors.text }]}>{reply.content}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <Modal
      isVisible
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={["down"]}
      style={styles.modal}
      propagateSwipe
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? -24 : 0}
      >
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <View style={styles.handle} />
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Comments</Text>
            
            <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
              <Ionicons name="search" size={20} color={colors.lightText} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder={`Search ${postOwnerName}'s magic tricks`}
                placeholderTextColor={colors.lightText}
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
          </View>

          <FlatList
            ref={flatListRef}
            data={filteredComments}
            keyExtractor={item => item.id}
            refreshing={refreshing}
            onRefresh={loadComments}
            style={styles.commentsList}
            contentContainerStyle={{ paddingBottom: 100 }}
            renderItem={renderComment}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={48} color={colors.lightText} />
                <Text style={[styles.emptyText, { color: colors.text }]}>No comments yet</Text>
                <Text style={[styles.emptySubtext, { color: colors.lightText }]}>Be the first to comment!</Text>
              </View>
            }
            keyboardDismissMode="on-drag"
          />

          {replyingTo && (
            <View style={[styles.replyingToContainer, { backgroundColor: colors.card }]}>
              <Text style={[styles.replyingToText, { color: colors.lightText }]}>
                Replying to {replyingTo.username}
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close" size={20} color={colors.lightText} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputWrapper, { backgroundColor: colors.background }]}>
            {showEmojiPicker && (
              <View style={[styles.emojiContainer, { backgroundColor: colors.card }]}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {EMOJI_REACTIONS.map((emoji, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.emojiButton}
                      onPress={() => setComment(prev => prev + emoji)}
                    >
                      <Text style={styles.emojiText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={[styles.inputRow, { backgroundColor: colors.card }]}>
              <TouchableOpacity onPress={toggleEmojiPicker} style={styles.inputIcon}>
                <Ionicons 
                  name={showEmojiPicker ? "close" : "happy-outline"} 
                  size={24} 
                  color={colors.lightText} 
                />
              </TouchableOpacity>
              
              <Image 
                source={{ uri: user?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} 
                style={styles.inputProfilePhoto} 
              />
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder={`Add a comment for ${postOwnerName}`}
                placeholderTextColor={colors.lightText}
                value={comment}
                onChangeText={setComment}
                multiline
                onFocus={() => setShowEmojiPicker(false)}
              />
              <TouchableOpacity style={styles.inputIcon}>
                <Ionicons name="gift-outline" size={24} color={colors.lightText} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.sendButton, { backgroundColor: comment.trim() ? colors.primary : colors.lightText }]}
                onPress={handleComment}
                disabled={loading || !comment.trim()}
              >
                <Ionicons 
                  name="send" 
                  size={20} 
                  color="white" 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: { 
    justifyContent: "flex-end", 
    margin: 0 
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
    flex: 1,
    maxHeight: screenHeight * 0.95,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#eee",
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  commentsList: {
    flex: 1,
  },
  commentItem: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentInfo: {
    flex: 1,
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTime: {
    fontSize: 12,
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  likeCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  replyButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  viewRepliesButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  repliesContainer: {
    marginTop: 12,
    marginLeft: 20,
  },
  replyItem: {
    marginBottom: 8,
    borderRadius: 8,
    padding: 8,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  replyProfilePhoto: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  replyInfo: {
    flex: 1,
  },
  replyUser: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  replyTime: {
    fontSize: 10,
  },
  replyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 14,
  },
  inputWrapper: {
    paddingBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 20,
    padding: 8,
    paddingHorizontal: 12,
  },
  inputProfilePhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 80,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  inputIcon: {
    padding: 4,
    marginRight: 4,
  },
  emojiContainer: {
    borderRadius: 20,
    padding: 8,
    marginBottom: 8,
  },
  emojiButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  emojiText: {
    fontSize: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});