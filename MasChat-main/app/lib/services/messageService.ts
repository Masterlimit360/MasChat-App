import { supabase } from '../../../lib/supabase';

export interface Message {
  id: string;
  sender: { id: string };
  recipient: { id: string };
  content?: string;
  image?: any;
  audio?: any;
  time?: string;
  sentAt?: string;
  isPending?: boolean;
  failed?: boolean;
  read?: boolean;
}

export interface RecentChat {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isOnline: boolean;
}

export const messageService = {
  // Get conversation between two users
  async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data?.map(message => ({
        id: message.id,
        sender: { id: message.sender_id },
        recipient: { id: message.recipient_id },
        content: message.content,
        image: message.image_url,
        audio: message.audio_url,
        time: message.created_at,
        sentAt: message.created_at,
        isPending: false,
        failed: false,
        read: message.read || false
      })) || [];
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  },

  // Send message
  async sendMessage(senderId: string, recipientId: string, content: string, imageUrl?: string, audioUrl?: string): Promise<Message> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          content: content,
          image_url: imageUrl,
          audio_url: audioUrl,
          read: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        sender: { id: data.sender_id },
        recipient: { id: data.recipient_id },
        content: data.content,
        image: data.image_url,
        audio: data.audio_url,
        time: data.created_at,
        sentAt: data.created_at,
        isPending: false,
        failed: false,
        read: data.read
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Get recent chats for a user
  async getRecentChats(userId: string): Promise<RecentChat[]> {
    try {
      // This is a simplified version - you might need to implement a more complex query
      // to get the actual last message and unread count
      const { data, error } = await supabase
        .from('messages')
        .select(`
          recipient:recipient_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Group by recipient and get unique chats
      const uniqueChats = new Map();
      data?.forEach(message => {
        const recipient = message.recipient;
        if (recipient && !uniqueChats.has(recipient.id)) {
          uniqueChats.set(recipient.id, {
            id: recipient.id,
            username: recipient.username,
            fullName: recipient.full_name,
            profilePicture: recipient.profile_image_url,
            lastMessage: 'Message',
            lastMessageTime: new Date().toISOString(),
            unreadCount: 0,
            isOnline: false
          });
        }
      });

      return Array.from(uniqueChats.values());
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  },

  // Mark message as read
  async markAsRead(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  },

  // Delete message
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  },

  // Get unread message count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
};