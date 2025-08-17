import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Contract ABIs (simplified for now - you'll need the full ABI after deployment)
const MASSCOIN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function registerUser(address user) external",
  "function platformTransfer(address from, address to, uint256 amount) external",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)"
];

const STAKING_ABI = [
  "function stake(uint256 amount, uint8 period) external",
  "function unstake(uint256 stakeIndex) external",
  "function claimRewards(uint256 stakeIndex) external",
  "function getUserStakes(address user) view returns (tuple(uint256 amount, uint256 startTime, uint256 endTime, uint8 period, bool isActive)[])",
  "function calculateRewards(address user, uint256 stakeIndex) view returns (uint256)"
];

// Contract addresses (update these after deployment)
const CONTRACT_ADDRESSES = {
  MASSCOIN: '0x0000000000000000000000000000000000000000', // Update after deployment
  STAKING: '0x0000000000000000000000000000000000000000', // Update after deployment
  PLATFORM: '0x0000000000000000000000000000000000000000' // Update after deployment
};

// Network configuration
const NETWORKS = {
  POLYGON: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com'
  },
  MUMBAI: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com'
  }
};

class Web3Service {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private massCoinContract: ethers.Contract | null = null;
  private stakingContract: ethers.Contract | null = null;
  private currentNetwork: string = 'MUMBAI'; // Default to testnet

  constructor() {
    this.initializeProvider();
  }

  private async initializeProvider() {
    try {
      // Use Mumbai testnet by default
      const network = NETWORKS[this.currentNetwork as keyof typeof NETWORKS];
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
      
      // Initialize contracts
      this.massCoinContract = new ethers.Contract(
        CONTRACT_ADDRESSES.MASSCOIN,
        MASSCOIN_ABI,
        this.provider
      );
      
      this.stakingContract = new ethers.Contract(
        CONTRACT_ADDRESSES.STAKING,
        STAKING_ABI,
        this.provider
      );
    } catch (error) {
      console.error('Failed to initialize Web3 provider:', error);
    }
  }

  // Connect wallet
  async connectWallet(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        // Web environment
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.provider = new ethers.BrowserProvider(window.ethereum);
        this.signer = await this.provider.getSigner();
        
        // Update contracts with signer
        if (this.massCoinContract) {
          this.massCoinContract = this.massCoinContract.connect(this.signer);
        }
        if (this.stakingContract) {
          this.stakingContract = this.stakingContract.connect(this.signer);
        }
        
        const address = await this.signer.getAddress();
        await AsyncStorage.setItem('wallet_address', address);
        return address;
      } else {
        // React Native environment - return stored address or null
        const storedAddress = await AsyncStorage.getItem('wallet_address');
        return storedAddress;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
  }

  // Get wallet address
  async getWalletAddress(): Promise<string | null> {
    if (this.signer) {
      return await this.signer.getAddress();
    }
    return await AsyncStorage.getItem('wallet_address');
  }

  // Get MassCoin balance
  async getBalance(address?: string): Promise<string> {
    try {
      if (!this.massCoinContract) {
        throw new Error('MassCoin contract not initialized');
      }

      const targetAddress = address || await this.getWalletAddress();
      if (!targetAddress) {
        throw new Error('No wallet address available');
      }

      const balance = await this.massCoinContract.balanceOf(targetAddress);
      return ethers.formatUnits(balance, 18); // MassCoin has 18 decimals
    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }

  // Transfer MassCoin
  async transfer(to: string, amount: string): Promise<boolean> {
    try {
      if (!this.massCoinContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await this.massCoinContract.transfer(to, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Transfer failed:', error);
      return false;
    }
  }

  // Platform transfer (for backend integration)
  async platformTransfer(from: string, to: string, amount: string): Promise<boolean> {
    try {
      if (!this.massCoinContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await this.massCoinContract.platformTransfer(from, to, amountWei);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Platform transfer failed:', error);
      return false;
    }
  }

  // Register user on blockchain
  async registerUser(address: string): Promise<boolean> {
    try {
      if (!this.massCoinContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const tx = await this.massCoinContract.registerUser(address);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('User registration failed:', error);
      return false;
    }
  }

  // Staking functions
  async stake(amount: string, period: number): Promise<boolean> {
    try {
      if (!this.stakingContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const amountWei = ethers.parseUnits(amount, 18);
      const tx = await this.stakingContract.stake(amountWei, period);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Staking failed:', error);
      return false;
    }
  }

  async unstake(stakeIndex: number): Promise<boolean> {
    try {
      if (!this.stakingContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const tx = await this.stakingContract.unstake(stakeIndex);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Unstaking failed:', error);
      return false;
    }
  }

  async claimRewards(stakeIndex: number): Promise<boolean> {
    try {
      if (!this.stakingContract || !this.signer) {
        throw new Error('Contract or signer not available');
      }

      const tx = await this.stakingContract.claimRewards(stakeIndex);
      await tx.wait();
      
      return true;
    } catch (error) {
      console.error('Claim rewards failed:', error);
      return false;
    }
  }

  // Get user stakes
  async getUserStakes(address?: string): Promise<any[]> {
    try {
      if (!this.stakingContract) {
        throw new Error('Staking contract not initialized');
      }

      const targetAddress = address || await this.getWalletAddress();
      if (!targetAddress) {
        throw new Error('No wallet address available');
      }

      const stakes = await this.stakingContract.getUserStakes(targetAddress);
      return stakes;
    } catch (error) {
      console.error('Failed to get user stakes:', error);
      return [];
    }
  }

  // Calculate rewards
  async calculateRewards(address: string, stakeIndex: number): Promise<string> {
    try {
      if (!this.stakingContract) {
        throw new Error('Staking contract not initialized');
      }

      const rewards = await this.stakingContract.calculateRewards(address, stakeIndex);
      return ethers.formatUnits(rewards, 18);
    } catch (error) {
      console.error('Failed to calculate rewards:', error);
      return '0';
    }
  }

  // Check if user is registered
  async isUserRegistered(address?: string): Promise<boolean> {
    try {
      if (!this.massCoinContract) {
        throw new Error('MassCoin contract not initialized');
      }

      const targetAddress = address || await this.getWalletAddress();
      if (!targetAddress) {
        return false;
      }

      const balance = await this.massCoinContract.balanceOf(targetAddress);
      return balance > 0;
    } catch (error) {
      console.error('Failed to check user registration:', error);
      return false;
    }
  }

  // Get contract info
  async getContractInfo() {
    try {
      if (!this.massCoinContract) {
        throw new Error('MassCoin contract not initialized');
      }

      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.massCoinContract.name(),
        this.massCoinContract.symbol(),
        this.massCoinContract.decimals(),
        this.massCoinContract.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatUnits(totalSupply, 18),
        address: CONTRACT_ADDRESSES.MASSCOIN
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      return null;
    }
  }

  // Switch network
  async switchNetwork(networkName: 'POLYGON' | 'MUMBAI'): Promise<boolean> {
    try {
      this.currentNetwork = networkName;
      await this.initializeProvider();
      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      return false;
    }
  }

  // Get current network
  getCurrentNetwork() {
    return NETWORKS[this.currentNetwork as keyof typeof NETWORKS];
  }

  // Format amount for display
  formatAmount(amount: string): string {
    try {
      const num = parseFloat(amount);
      if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
      } else {
        return num.toFixed(2);
      }
    } catch (error) {
      return '0';
    }
  }

  // Format USD value (mock for now)
  formatUsdValue(amount: string): string {
    try {
      const num = parseFloat(amount);
      const usdValue = num * 0.01; // Mock conversion rate
      return `$${usdValue.toFixed(2)}`;
    } catch (error) {
      return '$0.00';
    }
  }
}

// Create singleton instance
const web3Service = new Web3Service();

export default web3Service;

