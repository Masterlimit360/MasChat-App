import client from '../../api/client';

export type User = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
  email?: string;
  coverPhoto?: string;
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
  profilePicture?: string;
  content: string;
  createdAt: string;
  parentCommentId?: string;
  replies?: Comment[];
  likeCount: number;
  replyCount: number;
  isLikedByCurrentUser: boolean;
  timeAgo: string;
};

export const getPosts = async (): Promise<Post[]> => {
  const res = await client.get('/posts');
  return res.data;
};

export const createPost = async (post: { content?: string; imageUrl?: string; videoUrl?: string }, userId: string) => {
  const res = await client.post(`/posts?userId=${userId}`, post);
  return res.data;
};

export const deletePost = async (postId: string, userId: string) => {
  const res = await client.delete(`/posts/${postId}?userId=${userId}`);
  return res.data;
};

export const likePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/like?userId=${userId}`);
  return res.data;
};

export const unlikePost = async (postId: string, userId: string) => {
  const res = await client.post(`/posts/${postId}/unlike?userId=${userId}`);
  return res.data;
};

export const addComment = async (postId: string, userId: string, text: string) => {
  const res = await client.post(`/posts/${postId}/comment?userId=${userId}`, { content: text }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

export const addReply = async (postId: string, userId: string, parentCommentId: string, text: string) => {
  const res = await client.post(`/posts/${postId}/comment/${parentCommentId}/reply?userId=${userId}`, { content: text }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return res.data;
};

export const likeComment = async (commentId: string, userId: string) => {
  const res = await client.post(`/posts/comment/${commentId}/like?userId=${userId}`);
  return res.data;
};

export const unlikeComment = async (commentId: string, userId: string) => {
  const res = await client.post(`/posts/comment/${commentId}/unlike?userId=${userId}`);
  return res.data;
};

export const fetchPostComments = async (postId: string, currentUserId?: string): Promise<Comment[]> => {
  const params = currentUserId ? `?currentUserId=${currentUserId}` : '';
  const res = await client.get(`/posts/${postId}/comments${params}`);
  return res.data;
};

export const searchComments = async (postId: string, searchTerm: string, currentUserId?: string): Promise<Comment[]> => {
  const params = new URLSearchParams();
  params.append('searchTerm', searchTerm);
  if (currentUserId) params.append('currentUserId', currentUserId);
  const res = await client.get(`/posts/${postId}/comments/search?${params}`);
  return res.data;
};

export const getCommentReplies = async (commentId: string, currentUserId?: string): Promise<Comment[]> => {
  const params = currentUserId ? `?currentUserId=${currentUserId}` : '';
  const res = await client.get(`/posts/comment/${commentId}/replies${params}`);
  return res.data;
};

// Legacy function for backward compatibility
export const getComments = async (postId: string): Promise<Comment[]> => {
  return fetchPostComments(postId);
};