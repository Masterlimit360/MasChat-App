import client, { BASE_URL } from '../../api/client';
import { Post } from './postService';
import { uploadImageToCloudinary } from './cloudinaryService';

export type UserDetails = {
  profileType?: string;
  worksAt1?: string;
  worksAt2?: string;
  studiedAt?: string;
  wentTo?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  showAvatar?: boolean;
  avatar?: string;
  avatarSwipeEnabled?: boolean; // <-- Custom field if needed in your app logic
  followerCount?: number;
  followingCount?: number;
};

export type UserProfile = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  avatar?: string;
  details: UserDetails;
  verified?: boolean;
};

/**
 * Fetch user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await client.get(`/users/${userId}`);
    console.log("Fetched user profile:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update user profile fields
 */
export const updateProfile = async (
  userId: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const response = await client.put(`/users/${userId}/profile`, profileData);
    console.log("Updated user profile:", response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload image for profile picture, cover photo, or avatar
 */
export const uploadImage = async (
  imageUri: string,
  type: 'profilePicture' | 'coverPhoto' | 'avatar',
  userId: string,
  showAvatar?: boolean
): Promise<string> => {
  try {
    console.log(`Starting ${type} upload for user ${userId}`);
    console.log('Image URI:', imageUri);
    
    // Upload to Cloudinary first
    const folder = `maschat/${type}`;
    console.log('Uploading to Cloudinary folder:', folder);
    
    const cloudinaryUrl = await uploadImageToCloudinary(imageUri, folder);
    console.log('Cloudinary upload successful:', cloudinaryUrl);

    // Then save the Cloudinary URL to your backend
    let endpoint = '';
    if (type === 'profilePicture') {
      endpoint = `/users/${userId}/profile/picture`;
    } else if (type === 'coverPhoto') {
      endpoint = `/users/${userId}/cover/photo`;
    } else if (type === 'avatar') {
      endpoint = `/users/${userId}/avatar/picture${showAvatar !== undefined ? `?showAvatar=${showAvatar}` : ''}`;
    }

    console.log('Sending to backend endpoint:', endpoint);
    console.log('Payload:', { imageUrl: cloudinaryUrl });

    const response = await client.post(
      endpoint,
      { imageUrl: cloudinaryUrl },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    console.log('Backend response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Error uploading ${type}:`, error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    if (error.response?.status === 413) {
      throw new Error('Image file is too large. Please choose a smaller image.');
    } else if (error.response?.status === 415) {
      throw new Error('Invalid image format. Please choose a JPEG or PNG image.');
    } else if (error.response?.status === 400) {
      throw new Error(`Upload failed: ${error.response.data || 'Bad request'}`);
    } else if (error.response?.status === 500) {
      throw new Error('Server error. Please try again later.');
    } else {
      throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`);
    }
  }
};

/**
 * Simple image upload function for general use (used in ChatScreen)
 */
export const uploadImageSimple = async (imageUri: string): Promise<string> => {
  try {
    const folder = 'maschat/general';
    const cloudinaryUrl = await uploadImageToCloudinary(imageUri, folder);
    return cloudinaryUrl;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};

export type Notification = {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  avatar?: string;
};

export async function fetchNotifications(userId: string) {
  const res = await client.get(`/notifications?userId=${userId}`);
  return res.data.content as Notification[];
}

export async function markNotificationRead(notificationId: string) {
  await client.post(`/notifications/read/${notificationId}`);
}

export async function markMultipleNotificationsRead(notificationIds: string[]) {
  await client.post(`/notifications/mark-read`, { notificationIds });
}

export async function markAllNotificationsRead(userId: string) {
  await client.post(`/notifications/mark-all-read?userId=${userId}`);
}

// Friend request handling functions
export const acceptFriendRequest = async (requestId: string): Promise<void> => {
  try {
    console.log('Accepting friend request:', requestId);
    await client.post(`/friends/accept/${requestId}`);
    console.log('Friend request accepted successfully');
  } catch (error: any) {
    console.error('Error accepting friend request:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteFriendRequest = async (requestId: string): Promise<void> => {
  try {
    console.log('Deleting friend request:', requestId);
    await client.delete(`/friends/request/${requestId}`);
    console.log('Friend request deleted successfully');
  } catch (error: any) {
    console.error('Error deleting friend request:', error.response?.data || error.message);
    throw error;
  }
};

export const sendFriendRequest = async (senderId: string, receiverId: string): Promise<void> => {
  try {
    console.log('Sending friend request from', senderId, 'to', receiverId);
    await client.post('/friends/request', null, {
      params: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId)
      }
    });
    console.log('Friend request sent successfully');
  } catch (error: any) {
    console.error('Error sending friend request:', error.response?.data || error.message);
    throw error;
  }
};

export async function deleteNotification(notificationId: string) {
  await client.delete(`/notifications/${notificationId}`);
}

export async function deleteMultipleNotifications(notificationIds: string[]) {
  await client.delete(`/notifications/delete-multiple`, { data: { notificationIds } });
}

export async function deleteFriendRequestOld(requestId: string, userId: string) {
  await client.delete('/users/request', { data: { fromUserId: requestId, toUserId: userId } });
}

export async function unfriend(userId: string, friendId: string): Promise<void> {
  await client.delete(`/friends/remove?userId=${userId}&friendId=${friendId}`);
}

export type Friend = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export async function getUserFriends(userId: string): Promise<Friend[]> {
  try {
    const response = await client.get(`/friends/list/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user friends:', error.response?.data || error.message);
    throw error;
  }
}

export async function getUserPosts(userId: string): Promise<Post[]> {
  try {
    const response = await client.get(`/posts/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user posts:', error.response?.data || error.message);
    throw error;
  }
}

export async function getBestFriends(userId: string): Promise<Friend[]> {
  try {
    const response = await client.get(`/users/${userId}/best-friends`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching best friends:', error.response?.data || error.message);
    throw error;
  }
}

export default function UserService() {
  return null;
}
