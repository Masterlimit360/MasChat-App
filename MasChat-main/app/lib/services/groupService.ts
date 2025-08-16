import client from '../../api/client';

export interface Group {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  isPrivate: boolean;
  isAdmin: boolean;
  isMember: boolean;
  category: string;
  lastActivity: string;
  unreadMessages: number;
  members: GroupMember[];
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'admin' | 'moderator' | 'member';
  isOnline: boolean;
}

export interface GroupStats {
  totalGroups: number;
  myGroups: number;
  pendingInvites: number;
  totalMembers: number;
}

export interface CreateGroupRequest {
  name: string;
  description: string;
  isPrivate: boolean;
  category: string;
  imageUrl?: string;
}

class GroupService {
  private baseUrl = '/groups';

  async getMyGroups(): Promise<Group[]> {
    try {
      const response = await client.get(`${this.baseUrl}/my-groups`);
      return this.transformGroups(response.data);
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching my groups:', error);
      }
      return this.getMockGroups();
    }
  }

  async getPublicGroups(): Promise<Group[]> {
    try {
      const response = await client.get(`${this.baseUrl}/public`);
      return this.transformGroups(response.data);
    } catch (error: any) {
      // Only log non-403 errors (403 is expected when not authenticated)
      if (error?.response?.status !== 403) {
        console.error('Error fetching public groups:', error);
      }
      return this.getMockPublicGroups();
    }
  }

  async searchGroups(query: string): Promise<Group[]> {
    try {
      const response = await client.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
      return this.transformGroups(response.data);
    } catch (error) {
      console.error('Error searching groups:', error);
      return this.getMockGroups().filter(group => 
        group.name.toLowerCase().includes(query.toLowerCase()) ||
        group.description.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  async createGroup(groupData: CreateGroupRequest): Promise<Group> {
    try {
      const response = await client.post(this.baseUrl, groupData);
      return this.transformGroup(response.data);
    } catch (error) {
      console.error('Error creating group:', error);
      throw new Error('Failed to create group');
    }
  }

  async joinGroup(groupId: string): Promise<boolean> {
    try {
      await client.post(`${this.baseUrl}/${groupId}/join`);
      return true;
    } catch (error) {
      console.error('Error joining group:', error);
      return false;
    }
  }

  async leaveGroup(groupId: string): Promise<boolean> {
    try {
      await client.post(`${this.baseUrl}/${groupId}/leave`);
      return true;
    } catch (error) {
      console.error('Error leaving group:', error);
      return false;
    }
  }

  async getGroupById(groupId: string): Promise<Group> {
    try {
      const response = await client.get(`${this.baseUrl}/${groupId}`);
      return this.transformGroup(response.data);
    } catch (error) {
      console.error('Error fetching group:', error);
      throw new Error('Group not found');
    }
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    try {
      const response = await client.get(`${this.baseUrl}/${groupId}/members`);
      return this.transformMembers(response.data);
    } catch (error) {
      console.error('Error fetching group members:', error);
      return this.getMockMembers();
    }
  }

  async isUserMember(groupId: string): Promise<boolean> {
    try {
      const response = await client.get(`${this.baseUrl}/${groupId}/is-member`);
      return response.data;
    } catch (error) {
      console.error('Error checking membership:', error);
      return false;
    }
  }

  async isUserAdmin(groupId: string): Promise<boolean> {
    try {
      const response = await client.get(`${this.baseUrl}/${groupId}/is-admin`);
      return response.data;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  private transformGroups(groups: any[]): Group[] {
    return groups.map(group => this.transformGroup(group));
  }

  private transformGroup(group: any): Group {
    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description,
      imageUrl: group.imageUrl,
      memberCount: group.memberCount || 0,
      isPrivate: group.isPrivate,
      isAdmin: false, // Will be set by individual calls
      isMember: false, // Will be set by individual calls
      category: group.category,
      lastActivity: new Date().toISOString(),
      unreadMessages: 0,
      members: []
    };
  }

  private transformMembers(members: any[]): GroupMember[] {
    return members.map(member => ({
      id: member.id.toString(),
      name: member.userName,
      avatar: member.userAvatar,
      role: member.role.toLowerCase(),
      isOnline: Math.random() > 0.5
    }));
  }

  private getMockGroups(): Group[] {
    return [
      {
        id: '1',
        name: 'MasChat Developers',
        description: 'Official group for MasChat app developers and contributors',
        imageUrl: 'https://i.imgur.com/group1.jpg',
        memberCount: 45,
        isPrivate: false,
        isAdmin: true,
        isMember: true,
        category: 'Technology',
        lastActivity: new Date().toISOString(),
        unreadMessages: 3,
        members: []
      },
      {
        id: '2',
        name: 'Photography Enthusiasts',
        description: 'Share your best photos and get feedback from fellow photographers',
        imageUrl: 'https://i.imgur.com/group2.jpg',
        memberCount: 128,
        isPrivate: false,
        isAdmin: false,
        isMember: true,
        category: 'Photography',
        lastActivity: new Date(Date.now() - 3600000).toISOString(),
        unreadMessages: 0,
        members: []
      },
      {
        id: '3',
        name: 'Travel Stories',
        description: 'Share your travel experiences and discover amazing destinations',
        imageUrl: 'https://i.imgur.com/group3.jpg',
        memberCount: 89,
        isPrivate: false,
        isAdmin: false,
        isMember: true,
        category: 'Travel',
        lastActivity: new Date(Date.now() - 7200000).toISOString(),
        unreadMessages: 1,
        members: []
      }
    ];
  }

  private getMockPublicGroups(): Group[] {
    return [
      {
        id: '4',
        name: 'Fitness Motivation',
        description: 'Stay motivated with workout tips and progress sharing',
        imageUrl: 'https://i.imgur.com/group4.jpg',
        memberCount: 256,
        isPrivate: false,
        isAdmin: false,
        isMember: false,
        category: 'Fitness',
        lastActivity: new Date().toISOString(),
        unreadMessages: 0,
        members: []
      },
      {
        id: '5',
        name: 'Cooking Masterclass',
        description: 'Learn new recipes and cooking techniques from experts',
        imageUrl: 'https://i.imgur.com/group5.jpg',
        memberCount: 189,
        isPrivate: false,
        isAdmin: false,
        isMember: false,
        category: 'Food',
        lastActivity: new Date(Date.now() - 1800000).toISOString(),
        unreadMessages: 0,
        members: []
      }
    ];
  }

  private getMockMembers(): GroupMember[] {
    return [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://i.imgur.com/avatar1.jpg',
        role: 'admin',
        isOnline: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        avatar: 'https://i.imgur.com/avatar2.jpg',
        role: 'moderator',
        isOnline: false
      },
      {
        id: '3',
        name: 'Mike Johnson',
        avatar: 'https://i.imgur.com/avatar3.jpg',
        role: 'member',
        isOnline: true
      }
    ];
  }
}

export const groupService = new GroupService(); 