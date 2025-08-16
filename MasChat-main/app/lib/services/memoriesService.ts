import client from '../../api/client';

export interface Memory {
  id: string;
  type: 'post' | 'story' | 'reel' | 'photo';
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  likes: number;
  comments: number;
  shares: number;
  isVideo?: boolean;
  duration?: string;
}

export interface MemoryStats {
  totalMemories: number;
  thisYear: number;
  thisMonth: number;
  thisWeek: number;
  totalLikes: number;
  totalViews: number;
}

class MemoriesService {
  private baseUrl = '/memories';

  async getMemories(filter: string = 'all', year: number = new Date().getFullYear()): Promise<Memory[]> {
    try {
      const response = await client.get(`${this.baseUrl}?filter=${filter}&year=${year}`);
      return this.transformMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories:', error);
      return this.getMockMemories();
    }
  }

  async getMemoryStats(): Promise<MemoryStats> {
    try {
      const response = await client.get(`${this.baseUrl}/stats`);
      return this.transformStats(response.data);
    } catch (error) {
      console.error('Error fetching memory stats:', error);
      return this.getMockStats();
    }
  }

  async getOnThisDay(): Promise<Memory[]> {
    try {
      const response = await client.get(`${this.baseUrl}/on-this-day`);
      return this.transformMemories(response.data);
    } catch (error) {
      console.error('Error fetching on this day memories:', error);
      return this.getMockOnThisDayMemories();
    }
  }

  async getMemoriesByYear(year: number): Promise<Memory[]> {
    try {
      const response = await client.get(`${this.baseUrl}/year/${year}`);
      return this.transformMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories by year:', error);
      return this.getMockMemories();
    }
  }

  async getMemoriesByMonth(year: number, month: number): Promise<Memory[]> {
    try {
      const response = await client.get(`${this.baseUrl}/month/${year}/${month}`);
      return this.transformMemories(response.data);
    } catch (error) {
      console.error('Error fetching memories by month:', error);
      return this.getMockMemories();
    }
  }

  private transformMemories(memories: any[]): Memory[] {
    return memories.map(memory => ({
      id: memory.id.toString(),
      type: memory.type,
      title: memory.title,
      description: memory.description,
      imageUrl: memory.imageUrl,
      date: new Date(memory.date).toISOString().split('T')[0],
      likes: memory.likes || 0,
      comments: memory.comments || 0,
      shares: memory.shares || 0,
      isVideo: memory.isVideo || false,
      duration: memory.duration
    }));
  }

  private transformStats(stats: any): MemoryStats {
    return {
      totalMemories: stats.totalMemories || 0,
      thisYear: stats.thisYear || 0,
      thisMonth: stats.thisMonth || 0,
      thisWeek: stats.thisWeek || 0,
      totalLikes: stats.totalLikes || 0,
      totalViews: stats.totalViews || 0
    };
  }

  private getMockMemories(): Memory[] {
    return [
      {
        id: '1',
        type: 'post',
        title: 'Amazing Sunset',
        description: 'Beautiful sunset at the beach today! 🌅',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        date: '2024-01-15',
        likes: 234,
        comments: 45,
        shares: 12
      },
      {
        id: '2',
        type: 'story',
        title: 'Coffee Time',
        description: 'Perfect morning with coffee ☕',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        date: '2024-01-14',
        likes: 89,
        comments: 23,
        shares: 5
      },
      {
        id: '3',
        type: 'reel',
        title: 'Dance Moves',
        description: 'Learning new dance moves 💃',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
        date: '2024-01-13',
        likes: 567,
        comments: 78,
        shares: 34,
        isVideo: true,
        duration: '0:30'
      },
      {
        id: '4',
        type: 'photo',
        title: 'Mountain View',
        description: 'Hiking adventure 🏔️',
        imageUrl: 'https://images.unsplash.com/photo-1464822759844-d150baec0134?w=400',
        date: '2024-01-12',
        likes: 123,
        comments: 15,
        shares: 8
      },
      {
        id: '5',
        type: 'post',
        title: 'City Lights',
        description: 'Night photography 📸',
        imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=400',
        date: '2024-01-11',
        likes: 345,
        comments: 67,
        shares: 23
      }
    ];
  }

  private getMockStats(): MemoryStats {
    return {
      totalMemories: 156,
      thisYear: 45,
      thisMonth: 12,
      thisWeek: 3,
      totalLikes: 2345,
      totalViews: 12345
    };
  }

  private getMockOnThisDayMemories(): Memory[] {
    return [
      {
        id: '6',
        type: 'post',
        title: 'Throwback Thursday',
        description: 'Remembering this amazing day from last year! 📸',
        imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
        date: '2023-01-15',
        likes: 189,
        comments: 32,
        shares: 8
      },
      {
        id: '7',
        type: 'story',
        title: 'Old Memories',
        description: 'This time last year... ☕',
        imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
        date: '2022-01-15',
        likes: 67,
        comments: 12,
        shares: 3
      }
    ];
  }
}

export const memoriesService = new MemoriesService(); 