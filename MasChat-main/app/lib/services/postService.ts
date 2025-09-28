import { supabase } from '../../../lib/supabase';

export type User = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  email?: string;
  bio?: string;
  verified?: boolean;
};

export type Post = {
  id: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  user: User;
  likedBy?: string[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  comments?: Comment[];
};

export type Comment = {
  id: string;
  userId: string;
  username: string;
  userProfilePicture?: string;
  text: string;
  createdAt: string;
  replyCount: number;
  isLikedByCurrentUser: boolean;
  timeAgo: string;
};

export const getPosts = async (): Promise<Post[]> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:user_id (
          id,
          username,
          full_name,
          profile_image_url,
          email,
          bio
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(post => ({
      id: post.id,
      content: post.content,
      imageUrl: post.image_url,
      videoUrl: post.video_url,
      createdAt: post.created_at,
      user: {
        id: post.user.id,
        username: post.user.username,
        fullName: post.user.full_name,
        profilePicture: post.user.profile_image_url,
        email: post.user.email,
        bio: post.user.bio
      },
      likedBy: post.liked_by || [],
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      shareCount: post.share_count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

export const createPost = async (post: { content?: string; imageUrl?: string; videoUrl?: string }, userId: string): Promise<Post> => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        content: post.content,
        image_url: post.imageUrl,
        video_url: post.videoUrl,
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
          full_name,
          profile_image_url,
          email,
          bio
        )
      `)
      .single();

    if (error) throw error;

    return {
      id: data.id,
      content: data.content,
      imageUrl: data.image_url,
      videoUrl: data.video_url,
      createdAt: data.created_at,
      user: {
        id: data.user.id,
        username: data.user.username,
        fullName: data.user.full_name,
        profilePicture: data.user.profile_image_url,
        email: data.user.email,
        bio: data.user.bio
      },
      likedBy: data.liked_by || [],
      likeCount: data.like_count || 0,
      commentCount: data.comment_count || 0,
      shareCount: data.share_count || 0
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
};

export const deletePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

export const likePost = async (postId: string, userId: string): Promise<void> => {
  try {
    // Get current post data
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('liked_by, like_count')
      .eq('id', postId)
      .single();

    if (fetchError) throw fetchError;

    const likedBy = post.liked_by || [];
    const isLiked = likedBy.includes(userId);

    if (isLiked) {
      // Unlike: remove user from liked_by array and decrement count
      const newLikedBy = likedBy.filter(id => id !== userId);
      const newLikeCount = Math.max(0, (post.like_count || 0) - 1);

      const { error } = await supabase
        .from('posts')
        .update({
          liked_by: newLikedBy,
          like_count: newLikeCount
        })
        .eq('id', postId);

      if (error) throw error;
    } else {
      // Like: add user to liked_by array and increment count
      const newLikedBy = [...likedBy, userId];
      const newLikeCount = (post.like_count || 0) + 1;

      const { error } = await supabase
        .from('posts')
        .update({
          liked_by: newLikedBy,
          like_count: newLikeCount
        })
        .eq('id', postId);

      if (error) throw error;
    }
  } catch (error) {
    console.error('Error liking post:', error);
    throw error;
  }
};

export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  // This is handled by the likePost function based on current state
  return likePost(postId, userId);
};

export const addComment = async (postId: string, userId: string, text: string): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
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

    // Update comment count on post
    const { error: updateError } = await supabase.rpc('increment_comments', {
      post_id: postId
    });

    if (updateError) {
      console.warn('Failed to update comment count:', updateError);
    }

    return {
      id: data.id,
      userId: data.user_id,
      username: data.user.username,
      userProfilePicture: data.user.profile_image_url,
      text: data.text,
      createdAt: data.created_at,
      replyCount: 0,
      isLikedByCurrentUser: false,
      timeAgo: 'now'
    };
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
};

export const addReply = async (postId: string, userId: string, parentCommentId: string, text: string): Promise<Comment> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: userId,
        parent_comment_id: parentCommentId,
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

    return {
      id: data.id,
      userId: data.user_id,
      username: data.user.username,
      userProfilePicture: data.user.profile_image_url,
      text: data.text,
      createdAt: data.created_at,
      replyCount: 0,
      isLikedByCurrentUser: false,
      timeAgo: 'now'
    };
  } catch (error) {
    console.error('Error adding reply:', error);
    throw error;
  }
};

export const getComments = async (postId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:user_id (
          id,
          username,
          profile_image_url
        )
      `)
      .eq('post_id', postId)
      .is('parent_comment_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(comment => ({
      id: comment.id,
      userId: comment.user_id,
      username: comment.user.username,
      userProfilePicture: comment.user.profile_image_url,
      text: comment.text,
      createdAt: comment.created_at,
      replyCount: 0, // You can implement reply counting if needed
      isLikedByCurrentUser: false,
      timeAgo: 'now' // You can implement time ago calculation
    })) || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};