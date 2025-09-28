import { supabase } from '../../../lib/supabase';

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
      const { data, error } = await supabase
        .from('friends')
        .select(`
          friend:friend_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'accepted');

      if (error) throw error;

      console.log('Friends response:', data);
      return data?.map(friend => ({
        id: friend.friend.id,
        username: friend.friend.username,
        fullName: friend.friend.full_name,
        profilePicture: friend.friend.profile_image_url,
        isFriend: true
      })) || [];
    } catch (error) {
      console.error('Error getting friends:', error);
      return [];
    }
  },

  // Send friend request
  async sendFriendRequest(senderId: string, receiverId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: senderId,
          friend_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      return false;
    }
  },

  // Accept friend request
  async acceptFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      return false;
    }
  },

  // Reject friend request
  async rejectFriendRequest(requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      return false;
    }
  },

  // Get friend requests
  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select(`
          *,
          sender:user_id (
            id,
            username,
            full_name,
            profile_image_url
          ),
          receiver:friend_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) throw error;

      return data?.map(request => ({
        id: request.id,
        sender: {
          id: request.sender.id,
          username: request.sender.username,
          fullName: request.sender.full_name,
          profilePicture: request.sender.profile_image_url
        },
        receiver: {
          id: request.receiver.id,
          username: request.receiver.username,
          fullName: request.receiver.full_name,
          profilePicture: request.receiver.profile_image_url
        },
        status: request.status,
        createdAt: request.created_at
      })) || [];
    } catch (error) {
      console.error('Error getting friend requests:', error);
      return [];
    }
  },

  // Remove friend
  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('user_id', userId)
        .eq('friend_id', friendId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      return false;
    }
  },

  // Check if users are friends
  async areFriends(userId1: string, userId2: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('friends')
        .select('id')
        .eq('user_id', userId1)
        .eq('friend_id', userId2)
        .eq('status', 'accepted')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  },

  // Get friend suggestions
  async getFriendSuggestions(userId: string): Promise<User[]> {
    try {
      // Get users who are not already friends or have pending requests
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          username,
          full_name,
          profile_image_url
        `)
        .neq('id', userId)
        .limit(10);

      if (error) throw error;

      return data?.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        profilePicture: user.profile_image_url,
        isFriend: false
      })) || [];
    } catch (error) {
      console.error('Error getting friend suggestions:', error);
      return [];
    }
  }
};