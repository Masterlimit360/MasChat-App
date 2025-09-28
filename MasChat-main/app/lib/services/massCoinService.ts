import { supabase } from '../../../lib/supabase';
import web3Service from './web3Service';

export interface WalletInfo {
  id: number;
  userId: number;
  address: string;
  balance: number;
  stakedAmount?: number;
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
  message?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: number;
    username: string;
    fullName?: string;
  };
  recipient?: {
    id: number;
    username: string;
    fullName?: string;
  };
}

class MassCoinService {
  private useBlockchain: boolean = false;

  constructor() {
    // Check if blockchain is available
    this.useBlockchain = web3Service.isBlockchainEnabled();
  }

  // Get user's MassCoin balance
  async getBalance(userId: number): Promise<number> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain balance
        return await web3Service.getBalance();
      } else {
        // Use centralized balance from Supabase
        const { data, error } = await supabase
          .from('users')
          .select('mass_coin_balance')
          .eq('id', userId)
          .single();

        if (error) throw error;
        return data?.mass_coin_balance || 0;
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  // Transfer MassCoins
  async transfer(senderId: number, recipientId: number, amount: number, message?: string): Promise<boolean> {
    try {
      if (this.useBlockchain && web3Service.isBlockchainEnabled()) {
        // Use blockchain transfer
        const txHash = await web3Service.transfer(amount);
        if (txHash) {
          // Record transaction in database
          await this.recordTransaction(senderId, recipientId, amount, 'transfer', 'completed', txHash);
          return true;
        }
        return false;
      } else {
        // Use centralized transfer
        const { error } = await supabase.rpc('transfer_mass_coins', {
          sender_id: senderId,
          recipient_id: recipientId,
          amount: amount,
          message: message || null
        });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Failed to transfer MassCoins:', error);
      return false;
    }
  }

  // Record transaction in database
  private async recordTransaction(
    senderId: number, 
    recipientId: number, 
    amount: number, 
    type: string, 
    status: string, 
    txHash?: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('mass_coin_transactions')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          amount: amount,
          transaction_type: type,
          status: status,
          transaction_hash: txHash
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to record transaction:', error);
    }
  }

  // Get transaction history
  async getTransactionHistory(userId: number, limit: number = 50): Promise<TransactionInfo[]> {
    try {
      const { data, error } = await supabase
        .from('mass_coin_transactions')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            full_name
          ),
          recipient:recipient_id (
            id,
            username,
            full_name
          )
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map(tx => ({
        id: tx.id,
        senderId: tx.sender_id,
        recipientId: tx.recipient_id,
        amount: tx.amount,
        transactionType: tx.transaction_type,
        status: tx.status,
        transactionHash: tx.transaction_hash,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at
      })) || [];
    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  // Create transfer request
  async createTransferRequest(senderId: number, recipientId: number, amount: number, message?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transfer_requests')
        .insert({
          sender_id: senderId,
          recipient_id: recipientId,
          amount: amount,
          message: message,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to create transfer request:', error);
      return false;
    }
  }

  // Approve transfer request
  async approveTransferRequest(requestId: number, userId: number): Promise<boolean> {
    try {
      // Get the request details
      const { data: request, error: fetchError } = await supabase
        .from('transfer_requests')
        .select('*')
        .eq('id', requestId)
        .eq('recipient_id', userId)
        .eq('status', 'pending')
        .single();

      if (fetchError) throw fetchError;

      // Update request status
      const { error: updateError } = await supabase
        .from('transfer_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Execute the transfer
      const transferSuccess = await this.transfer(request.sender_id, request.recipient_id, request.amount, request.message);
      
      if (transferSuccess) {
        // Update request status to completed
        await supabase
          .from('transfer_requests')
          .update({ status: 'completed' })
          .eq('id', requestId);
      }

      return transferSuccess;
    } catch (error) {
      console.error('Failed to approve transfer request:', error);
      return false;
    }
  }

  // Reject transfer request
  async rejectTransferRequest(requestId: number, userId: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('transfer_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
        .eq('recipient_id', userId)
        .eq('status', 'pending');

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to reject transfer request:', error);
      return false;
    }
  }

  // Get transfer requests
  async getTransferRequests(userId: number): Promise<TransferRequestInfo[]> {
    try {
      const { data, error } = await supabase
        .from('transfer_requests')
        .select(`
          *,
          sender:sender_id (
            id,
            username,
            full_name
          ),
          recipient:recipient_id (
            id,
            username,
            full_name
          )
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(request => ({
        id: request.id,
        senderId: request.sender_id,
        recipientId: request.recipient_id,
        amount: request.amount,
        message: request.message,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at,
        sender: request.sender ? {
          id: request.sender.id,
          username: request.sender.username,
          fullName: request.sender.full_name
        } : undefined,
        recipient: request.recipient ? {
          id: request.recipient.id,
          username: request.recipient.username,
          fullName: request.recipient.full_name
        } : undefined
      })) || [];
    } catch (error) {
      console.error('Failed to get transfer requests:', error);
      return [];
    }
  }

  // Connect wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (web3Service.isBlockchainEnabled()) {
        const address = await web3Service.connectWallet();
        return address;
      }
      return null;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Get mock transfer requests for testing
  private getMockTransferRequests(): TransferRequestInfo[] {
    return [
      {
        id: 1,
        senderId: 1,
        recipientId: 2,
        amount: 100,
        message: 'Thanks for the help!',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sender: {
          id: 1,
          username: 'john_doe',
          fullName: 'John Doe'
        },
        recipient: {
          id: 2,
          username: 'jane_smith',
          fullName: 'Jane Smith'
        }
      }
    ];
  }
}

export default new MassCoinService();