import { supabase } from '../../../lib/supabase';
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

    console.log('Fetching reels from Supabase...');
    const { data, error } = await supabase
      .from('reels')
      .select(`
        *,
        user:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log('Reels response:', data);
    console.log('Number of reels received:', data?.length || 0);
    
    // Transform data to match expected format
    const transformedReels = data?.map(reel => ({
      id: reel.id,
      userId: reel.user_id,
      username: reel.user?.username || 'Unknown',
      profilePicture: reel.user?.profile_image_url,
      mediaUrl: reel.media_url,
      videoUrl: reel.media_url, // For backward compatibility
      caption: reel.caption,
      createdAt: reel.created_at,
      likedBy: reel.liked_by || [],
      likeCount: reel.like_count || 0,
      commentCount: reel.comment_count || 0,
      shareCount: reel.share_count || 0
    })) || [];
    
    // Cache the fetched reels
    await reelCacheService.cacheReels(transformedReels);
    
    return transformedReels;
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

export const createReel = async (reel: { mediaUrl: string; caption?: string }, userId: string): Promise<Reel> => {
  try {
    const { data, error } = await supabase
      .from('reels')
      .insert({
        user_id: userId,
        media_url: reel.mediaUrl,
        caption: reel.caption,
        like_count: 0,
        comment_count: 0,
        share_count: 0,
        liked_by: []
      })
      .select(`
        *,
        user:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .single();

    if (error) throw error;

    // Transform to match expected format
    return {
      id: data.id,
      userId: data.user_id,
      username: data.user?.username || 'Unknown',
      profilePicture: data.user?.profile_image_url,
      mediaUrl: data.media_url,
      videoUrl: data.media_url,
      caption: data.caption,
      createdAt: data.created_at,
      likedBy: data.liked_by || [],
      likeCount: data.like_count || 0,
      commentCount: data.comment_count || 0,
      shareCount: data.share_count || 0
    };
  } catch (error) {
    console.error('Error creating reel:', error);
    throw error;
  }
};

export const likeReel = async (reelId: string, userId: string): Promise<void> => {
  try {
    // Get current reel data
    const { data: reel, error: fetchError } = await supabase
      .from('reels')
      .select('liked_by, like_count')
      .eq('id', reelId)
      .single();

    if (fetchError) throw fetchError;

    const likedBy = reel.liked_by || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike: remove user from liked_by array and decrement count
      const newLikedBy = likedBy.filter(id => id !== userId);
      const newLikeCount = Math.max(0, (reel.like_count || 0) - 1);

      const { error } = await supabase
        .from('reels')
        .update({
          liked_by: newLikedBy,
          like_count: newLikeCount
        })
        .eq('id', reelId);

      if (error) throw error;
    } else {
      // Like: add user to liked_by array and increment count
      const newLikedBy = [...likedBy, userId];
      const newLikeCount = (reel.like_count || 0) + 1;

      const { error } = await supabase
        .from('reels')
        .update({
          liked_by: newLikedBy,
          like_count: newLikeCount
        })
        .eq('id', reelId);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error liking reel:', error);
    throw error;
  }
};

export const addReelComment = async (reelId: string, userId: string, text: string): Promise<ReelComment> => {
  try {
    const { data, error } = await supabase
      .from('reel_comments')
      .insert({
        reel_id: reelId,
        user_id: userId,
        text: text
      })
      .select(`
        *,
        user:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .single();

    if (error) throw error;

    // Update comment count on reel
    const { error: updateError } = await supabase.rpc('increment_reel_comments', {
      reel_id: reelId
    });

    if (updateError) {
      console.warn('Failed to update comment count:', updateError);
    }

    return {
      id: data.id,
      userId: data.user_id,
      username: data.user?.username || 'Unknown',
      profilePicture: data.user?.profile_image_url,
      text: data.text,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('Error adding reel comment:', error);
    throw error;
  }
};

export const getReelComments = async (reelId: string): Promise<ReelComment[]> => {
  try {
    const { data, error } = await supabase
      .from('reel_comments')
      .select(`
        *,
        user:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .eq('reel_id', reelId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      username: comment.user?.username || 'Unknown',
      profilePicture: comment.user?.profile_image_url,
      text: comment.text,
      createdAt: comment.created_at
    })) || [];
  } catch (error) {
    console.error('Error fetching reel comments:', error);
    throw error;
  }
};

export const shareReel = async (reelId: string): Promise<void> => {
  try {
    const { error } = await supabase.rpc('increment_reel_shares', {
      reel_id: reelId
    });

    if (error) throw error;
  } catch (error) {
    console.error('Error sharing reel:', error);
    throw error;
  }
};

export const deleteReel = async (reelId: string, userId: string): Promise<void> => {
  try {
    // First check if user owns the reel
    const { data: reel, error: fetchError } = await supabase
      .from('reels')
      .select('user_id')
      .eq('id', reelId)
      .single();

    if (fetchError) throw fetchError;

    if (reel.user_id !== userId) {
      throw new Error('Unauthorized: You can only delete your own reels');
    }

    // Delete the reel (cascade will handle comments)
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', reelId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting reel:', error);
    throw error;
  }
};