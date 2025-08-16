import client from '../../api/client';

export interface AIChatMessage {
  id: number;
  content: string;
  isUserMessage: boolean;
  sentAt: string;
  aiResponseTimeMs?: number;
  tokensUsed?: number;
  modelUsed?: string;
  errorMessage?: string;
}

export interface AIChat {
  id: number;
  sessionId: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
  isActive: boolean;
  messages: AIChatMessage[];
}

export const aiChatService = {
  // Create a new AI chat session
  async createNewChat(userId: string): Promise<AIChat> {
    try {
      const response = await client.post(`/ai-chat/create?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating new AI chat:', error);
      throw error;
    }
  },

  // Send a message to AI chat
  async sendMessage(userId: string, sessionId: string, message: string): Promise<AIChat> {
    try {
      const response = await client.post(`/ai-chat/send?userId=${userId}&sessionId=${sessionId}`, {
        message: message
      });
      return response.data;
    } catch (error) {
      console.error('Error sending AI message:', error);
      throw error;
    }
  },

  // Get chat history
  async getChatHistory(userId: string, sessionId: string): Promise<AIChat> {
    try {
      const response = await client.get(`/ai-chat/history?userId=${userId}&sessionId=${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting AI chat history:', error);
      throw error;
    }
  },

  // Get all user's AI chats
  async getUserChats(userId: string): Promise<AIChat[]> {
    try {
      const response = await client.get(`/ai-chat/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting user AI chats:', error);
      throw error;
    }
  },

  // Delete an AI chat session
  async deleteChat(userId: string, sessionId: string): Promise<void> {
    try {
      await client.delete(`/ai-chat/delete?userId=${userId}&sessionId=${sessionId}`);
    } catch (error) {
      console.error('Error deleting AI chat:', error);
      throw error;
    }
  },

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    try {
      const response = await client.get('/ai-chat/health');
      return response.data;
    } catch (error) {
      console.error('AI chat health check failed:', error);
      throw error;
    }
  },

  // Test database connection
  async testDatabase(): Promise<any> {
    try {
      const response = await client.get('/ai-chat/test-db');
      return response.data;
    } catch (error) {
      console.error('Database test failed:', error);
      throw error;
    }
  },

  // Initialize database tables
  async initializeDatabase(): Promise<any> {
    try {
      const response = await client.post('/ai-chat/init-db');
      return response.data;
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }
}; 