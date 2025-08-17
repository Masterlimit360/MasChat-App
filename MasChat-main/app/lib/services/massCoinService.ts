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
  private useBlockchain: boolean = true; // Toggle between blockchain and centralized

  // Get wallet information
  async getWallet(userId: number): Promise<WalletInfo> {
    try {
      if (this.useBlockchain) {
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
        // Use centralized backend
        const response = await client.get(`/api/masscoin/wallet/${userId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get wallet:', error);
      return this.getMockWallet();
    }
  }

  // Get user transactions
  async getUserTransactions(userId: number, page: number = 0, size: number = 10): Promise<TransactionInfo[]> {
    try {
      if (this.useBlockchain) {
        // For blockchain, we'll return mock data for now
        // In a real implementation, you'd query blockchain events
        return this.getMockTransactions();
      } else {
        // Use centralized backend
        const response = await client.get(`/api/masscoin/transactions/${userId}?page=${page}&size=${size}`);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return this.getMockTransactions();
    }
  }

  // Get user stats
  async getUserStats(userId: number): Promise<UserStats> {
    try {
      if (this.useBlockchain) {
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
        // Use centralized backend
        const response = await client.get(`/api/masscoin/stats/${userId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get user stats:', error);
      return {
        totalSent: 0,
        totalReceived: 0,
        totalTransactions: 0,
        averageTransactionAmount: 0
      };
    }
  }

  // Get withdrawals
  async getWithdrawals(userId: number): Promise<WithdrawalInfo[]> {
    try {
      if (this.useBlockchain) {
        // For blockchain, return mock data
        return [];
      } else {
        // Use centralized backend
        const response = await client.get(`/api/masscoin/withdrawals/${userId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get withdrawals:', error);
      return [];
    }
  }

  // Transfer MassCoin
  async transferMass(senderId: number, transferRequest: any): Promise<boolean> {
    try {
      if (this.useBlockchain) {
        // Use blockchain transfer
        const success = await web3Service.transfer(
          transferRequest.recipientAddress,
          transferRequest.amount.toString()
        );
        
        if (success) {
          // Also update backend for record keeping
          await client.post('/api/masscoin/transfer', {
            senderId,
            recipientId: transferRequest.recipientId,
            amount: transferRequest.amount,
            transactionType: 'SEND',
            status: 'COMPLETED',
            transactionHash: 'blockchain_tx_' + Date.now() // Mock hash
          });
        }
        
        return success;
      } else {
        // Use centralized backend
        const response = await client.post('/api/masscoin/transfer', {
          senderId,
          recipientId: transferRequest.recipientId,
          amount: transferRequest.amount,
          transactionType: 'SEND',
          status: 'PENDING'
        });
        return response.status === 200;
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    }
  }

  // Tip creator
  async tipCreator(senderId: number, creatorId: number, amount: number): Promise<boolean> {
    try {
      if (this.useBlockchain) {
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
        // Use centralized backend
        const response = await client.post('/api/masscoin/tip', {
          senderId,
          creatorId,
          amount,
          transactionType: 'TIP',
          status: 'COMPLETED'
        });
        return response.status === 200;
      }
    } catch (error) {
      console.error('Tip failed:', error);
      return false;
    }
  }

  // Request withdrawal
  async requestWithdrawal(withdrawalRequest: any): Promise<boolean> {
    try {
      if (this.useBlockchain) {
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
      if (this.useBlockchain) {
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
      if (this.useBlockchain) {
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
      if (this.useBlockchain) {
        // For blockchain, return mock data for now
        return [];
      } else {
        // Use centralized backend
        const response = await client.get(`/api/masscoin/transfer-requests/${userId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get transfer requests:', error);
      return [];
    }
  }

  // Connect wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (this.useBlockchain) {
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
      if (this.useBlockchain) {
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
      if (this.useBlockchain) {
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
    if (this.useBlockchain) {
      return web3Service.formatAmount(amount.toString());
    } else {
      if (amount >= 1000000) {
        return (amount / 1000000).toFixed(2) + 'M';
      } else if (amount >= 1000) {
        return (amount / 1000).toFixed(2) + 'K';
      } else {
        return amount.toFixed(2);
      }
    }
  }

  // Format USD value
  formatUsdValue(amount: number): string {
    if (this.useBlockchain) {
      return web3Service.formatUsdValue(amount.toString());
    } else {
      const usdValue = amount * 0.01; // Mock conversion rate
      return `$${usdValue.toFixed(2)}`;
    }
  }

  // Get transaction type label
  getTransactionTypeLabel(type: string): string {
    switch (type) {
      case 'SEND': return 'Sent';
      case 'RECEIVE': return 'Received';
      case 'TIP': return 'Tip';
      case 'WITHDRAWAL': return 'Withdrawal';
      case 'STAKE': return 'Staked';
      case 'UNSTAKE': return 'Unstaked';
      case 'REWARD': return 'Reward';
      default: return type;
    }
  }

  // Get status label
  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'COMPLETED': return 'Completed';
      case 'FAILED': return 'Failed';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return '#FFA500';
      case 'COMPLETED': return '#4CAF50';
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
      balance: 1000,
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
        amount: 100,
        transactionType: 'SEND',
        status: 'COMPLETED',
        transactionHash: '0x1234567890abcdef',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 2,
        senderId: 3,
        recipientId: 1,
        amount: 50,
        transactionType: 'RECEIVE',
        status: 'COMPLETED',
        transactionHash: '0xabcdef1234567890',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// Create singleton instance
const massCoinService = new MassCoinService();

export { massCoinService }; 