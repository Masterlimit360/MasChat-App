import client from '../../api/client';

export type Story = {
  id: string;
  userId: string;
  username: string;
  profilePicture?: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
};

export async function fetchStories() {
  const res = await client.get('/stories');
  return res.data as Story[];
}

export async function createStory(story: { mediaUrl: string; caption?: string }, userId: string) {
  const res = await client.post(`/stories/create`, { ...story, userId });
  return res.data;
}

export async function deleteStory(storyId: string, userId: string) {
  return client.delete(`/stories/${storyId}?userId=${userId}`);
}

export async function fetchStoriesByUser(userId: string) {
  const res = await client.get(`/stories/user/${userId}`);
  return res.data as Story[];
}

// Default export to fix warning
export default {
  fetchStories,
  createStory,
  deleteStory
}; 