import client from '../../api/client';
import { User } from './postService';
import reelCacheService from './reelCacheService';

export type Reel = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  mediaUrl: string;  // Primary media field
  videoUrl: string;  // For backward compatibility
  caption?: string;
  createdAt: string;
  likedBy?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  comments?: ReelComment[];
};

// Helper function to get the media URL from a reel
export const getReelMediaUrl = (reel: Reel): string => {
  let url = reel.mediaUrl || reel.videoUrl || '';
  
  // Fix common Cloudinary URL issues
  if (url.includes('cloudinary.com')) {
    // Ensure HTTPS is used
    if (url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    
    // Add optimization parameters for better loading
    if (url.includes('/upload/') && !url.includes('/upload/f_auto,q_auto/')) {
      url = url.replace('/upload/', '/upload/f_auto,q_auto/');
    }
    
    // Add optimization parameters for video URLs (without invalid timeout parameter)
    if (url.match(/\.(mp4|mov|avi|wmv|flv|webm|mkv)$/i)) {
      // Use quality optimization instead of timeout
      if (!url.includes('q_auto')) {
        url = url.replace('/upload/', '/upload/q_auto/');
      }
    }
  }
  
  return url;
};

// Helper function to check if a reel has valid media
export const hasValidMedia = (reel: Reel): boolean => {
  const mediaUrl = getReelMediaUrl(reel);
  return Boolean(mediaUrl && mediaUrl.startsWith('http'));
};

export type ReelComment = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  text: string;
  createdAt: string;
};

export const fetchReels = async (forceRefresh: boolean = false): Promise<Reel[]> => {
  try {
    // Check if we have fresh cached data
    if (!forceRefresh && await reelCacheService.isCacheFresh(30)) {
      console.log('Using cached reels data...');
      const cachedReels = await reelCacheService.getCachedReels();
      if (cachedReels.length > 0) {
        return cachedReels;
      }
    }

    console.log('Fetching reels from backend...');
    const res = await client.get('/reels');
    console.log('Reels response:', res.data);
    console.log('Number of reels received:', res.data.length);
    
    // Cache the fetched reels
    await reelCacheService.cacheReels(res.data);
    
    return res.data;
  } catch (error) {
    console.error('Error fetching reels:', error);
    
    // If network fails, try to return cached data
    try {
      console.log('Network failed, trying cached reels...');
      const cachedReels = await reelCacheService.getCachedReels();
      if (cachedReels.length > 0) {
        console.log('Returning cached reels as fallback');
        return cachedReels;
      }
    } catch (cacheError) {
      console.error('Error getting cached reels:', cacheError);
    }
    
    throw error;
  }
};

export const createReel = async (reel: { mediaUrl: string; caption?: string }, userId: string) => {
  try {
    console.log('Creating reel with data:', { ...reel, userId });
    const res = await client.post(`/reels/create`, { ...reel, userId });
    console.log('Reel created successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

export const deleteReel = async (reelId: string, userId: string) => {
  const res = await client.delete(`/reels/${reelId}?userId=${userId}`);
  return res.data;
};

export const likeReel = async (reelId: string, userId: string) => {
  const res = await client.post(`/reels/${reelId}/like?userId=${userId}`);
  return res.data;
};

export const unlikeReel = async (reelId: string, userId: string) => {
  const res = await client.post(`/reels/${reelId}/unlike?userId=${userId}`);
  return res.data;
};

export const addReelComment = async (reelId: string, userId: string, text: string) => {
  const res = await client.post(`/reels/${reelId}/comment?userId=${userId}`, text);
  return res.data;
};

export const getReelComments = async (reelId: string): Promise<ReelComment[]> => {
  const res = await client.get(`/reels/${reelId}/comments`);
  return res.data;
};

export const shareReel = async (reelId: string) => {
  const res = await client.post(`/reels/${reelId}/share`);
  return res.data;
};

// Helper function to test if a Cloudinary URL is accessible
export const testCloudinaryUrl = async (url: string): Promise<boolean> => {
  try {
    if (!url.includes('cloudinary.com')) {
      return true; // Not a Cloudinary URL, assume it's accessible
    }
    
    const response = await fetch(url, { 
      method: 'HEAD',
      headers: {
        'User-Agent': 'MasChat/1.0',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error testing Cloudinary URL:', url, error);
    return false;
  }
}; 