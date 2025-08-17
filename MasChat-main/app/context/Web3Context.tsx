import React, { createContext, useContext, useState } from 'react';
import { ethers } from 'ethers';

interface Web3ContextType {
  provider: any;
  signer: any;
  isBlockchainEnabled: boolean;
  enableBlockchain: () => void;
  mockAddress: string;
  connectWallet: () => Promise<string | null>;
  disconnectWallet: () => void;
  isConnected: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const mockAddress = '0x1234567890123456789012345678901234567890';

  const connectWallet = async (): Promise<string | null> => {
    try {
      if (!isBlockchainEnabled) {
        // Return mock address when blockchain is disabled
        setIsConnected(true);
        return mockAddress;
      }

      if (typeof window !== 'undefined' && window.ethereum) {
        // Web environment with MetaMask
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const web3Provider = new ethers.BrowserProvider(window.ethereum);
          const web3Signer = await web3Provider.getSigner();
          
          setProvider(web3Provider);
          setSigner(web3Signer);
          setIsConnected(true);
          
          return await web3Signer.getAddress();
        }
      } else {
        // React Native environment - return mock address for now
        console.log('Mobile wallet integration not yet implemented');
        setIsConnected(true);
        return mockAddress;
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      return null;
    }
    return null;
  };

  const disconnectWallet = () => {
    setProvider(null);
    setSigner(null);
    setIsConnected(false);
  };

  const enableBlockchain = () => {
    setIsBlockchainEnabled(true);
  };

  return (
    <Web3Context.Provider value={{ 
      provider, 
      signer,
      isBlockchainEnabled, 
      enableBlockchain,
      mockAddress,
      connectWallet,
      disconnectWallet,
      isConnected
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}