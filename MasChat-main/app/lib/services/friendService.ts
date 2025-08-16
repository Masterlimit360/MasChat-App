import client from '../../api/client';

export interface User {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  isFriend?: boolean;
}

export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: string;
  createdAt: string;
}

export const friendService = {
  // Get user's friends list
  async getFriends(userId: string): Promise<User[]> {
    try {
      console.log('Fetching friends for user:', userId);
      const response = await client.get(`/friends/list/${userId}`);
      console.log('Friends response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  },

  // Get friend suggestions
  async getSuggestions(userId: string): Promise<User[]> {
    try {
      console.log('Fetching suggestions for user:', userId);
      const response = await client.get(`/friends/suggestions/${userId}`);
      console.log('Suggestions response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error getting suggestions:', error);
      return [];
    }
  },

  // Get messenger suggestions (friends you haven't chatted with)
  async getMessengerSuggestions(userId: string): Promise<User[]> {
    try {
      console.log('Fetching messenger suggestions for user:', userId);
      const response = await client.get(`/friends/messenger-suggestions/${userId}`);
      console.log('Messenger suggestions response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error getting messenger suggestions:', error);
      return [];
    }
  },

  // Send friend request
  async sendFriendRequest(senderId: string, recipientId: string): Promise<void> {
    try {
      console.log('Sending friend request from', senderId, 'to', recipientId);
      await client.post('/friends/request', null, {
        params: { 
          senderId: parseInt(senderId), 
          recipientId: parseInt(recipientId) 
        }
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      console.log('Accepting friend request:', requestId);
      await client.post(`/friends/accept/${requestId}`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  // Delete friend request
  async deleteFriendRequest(requestId: string): Promise<void> {
    try {
      console.log('Deleting friend request:', requestId);
      await client.delete(`/friends/request/${requestId}`);
    } catch (error) {
      console.error('Error deleting friend request:', error);
      throw error;
    }
  },

  // Cancel friend request
  async cancelFriendRequest(senderId: string, receiverId: string): Promise<void> {
    try {
      console.log('Cancelling friend request from', senderId, 'to', receiverId);
      await client.delete(`/friends/cancel?senderId=${parseInt(senderId)}&receiverId=${parseInt(receiverId)}`);
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      throw error;
    }
  },

  // Get pending friend requests
  async getPendingRequests(userId: string): Promise<FriendRequest[]> {
    try {
      console.log('Fetching pending requests for user:', userId);
      const response = await client.get(`/friends/pending/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  },

  // Check if friend request exists between two users
  async checkFriendRequestStatus(senderId: string, receiverId: string): Promise<string> {
    try {
      console.log('Checking friend request status between', senderId, 'and', receiverId);
      const response = await client.get(`/friends/status?senderId=${parseInt(senderId)}&receiverId=${parseInt(receiverId)}`);
      return response.data?.status || 'NONE';
    } catch (error) {
      console.error('Error checking friend request status:', error);
      return 'NONE';
    }
  },

  // Search users
  async searchUsers(query: string): Promise<User[]> {
    try {
      console.log('Searching users with query:', query);
      const response = await client.get(`/users/search?query=${encodeURIComponent(query)}`);
      return response.data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
};

// Default export to fix warning
export default friendService; 