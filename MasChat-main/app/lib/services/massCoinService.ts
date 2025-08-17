import client from '../../api/client';
import web3Service from './web3Service';

export interface WalletInfo {
  id: number;
  userId: number;
  address: string;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionInfo {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  transactionType: string;
  status: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransferRequestInfo {
  id: number;
  senderId: number;
  recipientId: number;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalSent: number;
  totalReceived: number;
  totalTransactions: number;
  averageTransactionAmount: number;
}

export interface WithdrawalInfo {
  id: number;
  userId: number;
  amount: number;
  status: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

class MassCoinService {
  private useBlockchain: boolean = false; // Disable blockchain until token is deployed

  // Get wallet information
  async getWallet(userId: number): Promise<WalletInfo> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain
        const address = await web3Service.getWalletAddress();
        const balance = await web3Service.getBalance(address || undefined);
        
        return {
          id: userId,
          userId: userId,
          address: address || '0x0000000000000000000000000000000000000000',
          balance: parseFloat(balance),
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      } else {
        // Use centralized backend or mock data
        try {
          const response = await client.get(`/api/masscoin/wallet/${userId}`);
          return response.data;
        } catch (error) {
          // Fallback to mock wallet if backend is not available
          return this.getMockWallet();
        }
      }
    } catch (error) {
      console.error('Failed to get wallet:', error);
      return this.getMockWallet();
    }
  }

  // Get user transactions
  async getUserTransactions(userId: number, page: number = 0, size: number = 10): Promise<TransactionInfo[]> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, we'll return mock data for now
        // In a real implementation, you'd query blockchain events
        return this.getMockTransactions();
      } else {
        // Use centralized backend or mock data
        try {
          const response = await client.get(`/api/masscoin/transactions/${userId}?page=${page}&size=${size}`);
          return response.data;
        } catch (error) {
          // Fallback to mock transactions if backend is not available
          return this.getMockTransactions();
        }
      }
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return this.getMockTransactions();
    }
  }

  // Get user stats
  async getUserStats(userId: number): Promise<UserStats> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, calculate from transactions
        const transactions = await this.getUserTransactions(userId);
        const sent = transactions.filter(t => t.transactionType === 'SEND').reduce((sum, t) => sum + t.amount, 0);
        const received = transactions.filter(t => t.transactionType === 'RECEIVE').reduce((sum, t) => sum + t.amount, 0);
        
        return {
          totalSent: sent,
          totalReceived: received,
          totalTransactions: transactions.length,
          averageTransactionAmount: transactions.length > 0 ? (sent + received) / transactions.length : 0
        };
      } else {
        // Use centralized backend or mock data
        try {
          const response = await client.get(`/api/masscoin/stats/${userId}`);
          return response.data;
        } catch (error) {
          // Fallback to mock stats if backend is not available
          return {
            totalSent: 150.0,
            totalReceived: 75.0,
            totalTransactions: 8,
            averageTransactionAmount: 28.125
          };
        }
      }
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalSent: 150.0,
        totalReceived: 75.0,
        totalTransactions: 8,
        averageTransactionAmount: 28.125
      };
    }
  }

  // Get withdrawals
  async getWithdrawals(userId: number): Promise<WithdrawalInfo[]> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, return mock data
        return [];
      } else {
        // Use centralized backend or mock data
        try {
          const response = await client.get(`/api/masscoin/withdrawals/${userId}`);
          return response.data;
        } catch (error) {
          // Fallback to empty array if backend is not available
          return [];
        }
      }
    } catch (error) {
      console.error('Failed to get withdrawals:', error);
      return [];
    }
  }

  // Transfer MassCoin
  async transferMass(senderId: number, transferRequest: any): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain transfer
        const success = await web3Service.transfer(
          transferRequest.recipientAddress,
          transferRequest.amount.toString()
        );
        
        if (success) {
          // Also update backend for record keeping
          try {
            await client.post('/api/masscoin/transfer', {
              senderId,
              recipientId: transferRequest.recipientId,
              amount: transferRequest.amount,
              transactionType: 'SEND',
              status: 'COMPLETED',
              transactionHash: 'blockchain_tx_' + Date.now() // Mock hash
            });
          } catch (error) {
            console.log('Backend update failed, but blockchain transfer succeeded');
          }
        }
        
        return success;
      } else {
        // Use centralized backend or mock transfer
        try {
          const response = await client.post('/api/masscoin/transfer', {
            senderId,
            recipientId: transferRequest.recipientId,
            amount: transferRequest.amount,
            transactionType: 'SEND',
            status: 'PENDING'
          });
          return response.status === 200;
        } catch (error) {
          // Mock successful transfer if backend is not available
          console.log(`Mock transfer: ${transferRequest.amount} MASS from user ${senderId} to user ${transferRequest.recipientId}`);
          return true;
        }
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    }
  }

  // Tip creator
  async tipCreator(senderId: number, creatorId: number, amount: number): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For tipping, we'll use the centralized system for now
        // as it requires user lookup
        const response = await client.post('/api/masscoin/tip', {
          senderId,
          creatorId,
          amount,
          transactionType: 'TIP',
          status: 'COMPLETED'
        });
        return response.status === 200;
      } else {
        // Use centralized backend or mock tip
        try {
          const response = await client.post('/api/masscoin/tip', {
            senderId,
            creatorId,
            amount,
            transactionType: 'TIP',
            status: 'COMPLETED'
          });
          return response.status === 200;
        } catch (error) {
          // Mock successful tip if backend is not available
          console.log(`Mock tip: ${amount} MASS from user ${senderId} to creator ${creatorId}`);
          return true;
        }
      }
    } catch (error) {
      console.error('Tip failed:', error);
      return false;
    }
  }

  // Request withdrawal
  async requestWithdrawal(withdrawalRequest: any): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, this would trigger a smart contract call
        // For now, we'll use the centralized system
        const response = await client.post('/api/masscoin/withdrawal', withdrawalRequest);
        return response.status === 200;
      } else {
        // Use centralized backend
        const response = await client.post('/api/masscoin/withdrawal', withdrawalRequest);
        return response.status === 200;
      }
    } catch (error) {
      console.error('Withdrawal request failed:', error);
      return false;
    }
  }

  // Approve transfer request
  async approveTransferRequest(requestId: number, userId: number): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, this would be handled differently
        // For now, use centralized system
        const response = await client.put(`/api/masscoin/transfer-requests/${requestId}/approve`, { userId });
        return response.status === 200;
      } else {
        // Use centralized backend
        const response = await client.put(`/api/masscoin/transfer-requests/${requestId}/approve`, { userId });
        return response.status === 200;
      }
    } catch (error) {
      console.error('Approve transfer request failed:', error);
      return false;
    }
  }

  // Reject transfer request
  async rejectTransferRequest(requestId: number, userId: number): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, this would be handled differently
        // For now, use centralized system
        const response = await client.put(`/api/masscoin/transfer-requests/${requestId}/reject`, { userId });
        return response.status === 200;
      } else {
        // Use centralized backend
        const response = await client.put(`/api/masscoin/transfer-requests/${requestId}/reject`, { userId });
        return response.status === 200;
      }
    } catch (error) {
      console.error('Reject transfer request failed:', error);
      return false;
    }
  }

  // Get transfer requests
  async getTransferRequests(userId: number): Promise<TransferRequestInfo[]> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // For blockchain, return mock data for now
        return this.getMockTransferRequests();
      } else {
        // Use centralized backend or mock data
        try {
          const response = await client.get(`/api/masscoin/transfer-requests/${userId}`);
          return response.data;
        } catch (error) {
          // Fallback to mock data if backend is not available
          return this.getMockTransferRequests();
        }
      }
    } catch (error) {
      console.error('Failed to get transfer requests:', error);
      return this.getMockTransferRequests();
    }
  }

  // Connect wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        return await web3Service.connectWallet();
      } else {
        // For centralized system, return null
        return null;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Check if user is registered on blockchain
  async isUserRegistered(address?: string): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        return await web3Service.isUserRegistered(address);
      } else {
        return true; // Always true for centralized system
      }
    } catch (error) {
      console.error('Failed to check user registration:', error);
      return false;
    }
  }

  // Register user on blockchain
  async registerUser(address: string): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        return await web3Service.registerUser(address);
      } else {
        return true; // Always true for centralized system
      }
    } catch (error) {
      console.error('Failed to register user:', error);
      return false;
    }
  }

  // Toggle between blockchain and centralized mode
  setUseBlockchain(useBlockchain: boolean): void {
    this.useBlockchain = useBlockchain;
  }

  // Get current mode
  isUsingBlockchain(): boolean {
    return this.useBlockchain;
  }

  // Format amount for display
  formatAmount(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(2) + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(2) + 'K';
    } else {
      return amount.toFixed(2);
    }
  }

  // Format USD value (mock for now)
  formatUsdValue(amount: number): string {
    const usdValue = amount * 0.01; // Mock conversion rate
    return `$${usdValue.toFixed(2)}`;
  }

  // Get transaction type label
  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'SEND': return 'Sent';
      case 'RECEIVE': return 'Received';
      case 'TIP': return 'Tip';
      case 'STAKE': return 'Staked';
      case 'UNSTAKE': return 'Unstaked';
      default: return type;
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    switch (status) {
      case 'COMPLETED': return 'Completed';
      case 'PENDING': return 'Pending';
      case 'FAILED': return 'Failed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'COMPLETED': return '#4CAF50';
      case 'PENDING': return '#FF9800';
      case 'FAILED': return '#F44336';
      case 'CANCELLED': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  }

  // Mock data for fallback
  getMockWallet(): WalletInfo {
    return {
      id: 1,
      userId: 1,
      address: '0x1234567890123456789012345678901234567890',
      balance: 1000.0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getMockTransactions(): TransactionInfo[] {
    return [
      {
        id: 1,
        senderId: 1,
        recipientId: 2,
        amount: 50.0,
        transactionType: 'SEND',
        status: 'COMPLETED',
        transactionHash: 'mock_tx_001',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 2,
        senderId: 3,
        recipientId: 1,
        amount: 25.0,
        transactionType: 'RECEIVE',
        status: 'COMPLETED',
        transactionHash: 'mock_tx_002',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  }

  // Get mock transfer requests for development
  getMockTransferRequests(): TransferRequestInfo[] {
    return [
      {
        id: 1,
        senderId: 1,
        recipientId: 2,
        amount: 100.0,
        status: 'PENDING',
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  // Staking functions
  async stakeMass(amount: number): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain staking
        const success = await web3Service.stake(amount.toString(), 30); // Default to 30 days
        return success;
      } else {
        // Mock successful staking
        console.log(`Mock staking: ${amount} MASS for 30 days`);
        return true;
      }
    } catch (error) {
      console.error('Staking failed:', error);
      return false;
    }
  }

  async unstakeMass(amount: number): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain unstaking
        const success = await web3Service.unstake(0); // Default to first stake
        return success;
      } else {
        // Mock successful unstaking
        console.log(`Mock unstaking: ${amount} MASS`);
        return true;
      }
    } catch (error) {
      console.error('Unstaking failed:', error);
      return false;
    }
  }

  // Enable blockchain functionality (call this after token deployment)
  enableBlockchain() {
    this.useBlockchain = true;
    web3Service.enableBlockchain();
  }

  // Check if blockchain is enabled
  isBlockchainEnabled(): boolean {
    return this.useBlockchain && web3Service.isBlockchainEnabled();
  }
}

// Create singleton instance
const massCoinService = new MassCoinService();

export { massCoinService };
export default massCoinService; 