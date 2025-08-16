import client from '../../api/client';

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
      const response = await client.get(`/messages/conversation?userId1=${userId1}&userId2=${userId2}`);
      return response.data;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return [];
    }
  },

  // Get recent chats for a user
  async getRecentChats(userId: string): Promise<RecentChat[]> {
    try {
      const response = await client.get(`/messages/recent/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting recent chats:', error);
      return [];
    }
  },

  // Send a message
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message | null> {
    try {
      const response = await client.post('/messages/send', null, {
        params: { senderId, recipientId, content }
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  },

  // Send an image message
  async sendImageMessage(senderId: string, recipientId: string, imageUrl: string, content?: string): Promise<Message | null> {
    try {
      console.log('Sending image message:', { senderId, recipientId, imageUrl, content });
      const response = await client.post('/messages/send-image', {
        senderId,
        recipientId,
        imageUrl,
        content,
      });
      console.log('Image message sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending image message:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return null;
    }
  },

  // Send an audio message
  async sendAudioMessage(senderId: string, recipientId: string, audioUrl: string, content?: string): Promise<Message | null> {
    try {
      console.log('Sending audio message:', { senderId, recipientId, audioUrl, content });
      const response = await client.post('/messages/send-audio', {
        senderId,
        recipientId,
        audioUrl,
        content,
      });
      console.log('Audio message sent successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error sending audio message:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return null;
    }
  },

  // Mark messages as read
  async markAsRead(userId: string, partnerId: string): Promise<void> {
    try {
      await client.post('/messages/mark-read', null, {
        params: { userId, partnerId }
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  },

  // Delete a message
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    try {
      await client.delete(`/messages/${messageId}?userId=${userId}`);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  },

  // Delete entire conversation
  async deleteConversation(userId: string, partnerId: string): Promise<void> {
    try {
      await client.delete('/messages/conversation', {
        params: { userId, partnerId }
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },

  // Test image column functionality
  async testImageColumn(): Promise<any> {
    try {
      const response = await client.get('/messages/test-image-column');
      return response.data;
    } catch (error: any) {
      console.error('Error testing image column:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }
};

// Default export to fix warning
export default messageService; 