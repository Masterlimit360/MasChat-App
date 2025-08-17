import React, { createContext, useContext, useState } from 'react';
import WalletConnectProvider, { useWalletConnect } from '@walletconnect/react-native-dapp';
import { ethers } from 'ethers';

interface Web3ContextType {
  connector: any;
  provider: any;
  isBlockchainEnabled: boolean;
  enableBlockchain: () => void;
  mockAddress: string;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const connector = useWalletConnect();
  const [provider, setProvider] = useState<any>(null);
  const [isBlockchainEnabled, setIsBlockchainEnabled] = useState(false);
  const mockAddress = '0x1234567890123456789012345678901234567890';

  React.useEffect(() => {
    if (connector && connector.connected && isBlockchainEnabled) {
      try {
        setProvider(new ethers.providers.Web3Provider(connector));
      } catch (error) {
        console.error('Failed to create Web3Provider:', error);
      }
    }
  }, [connector, isBlockchainEnabled]);

  const enableBlockchain = () => {
    setIsBlockchainEnabled(true);
  };

  return (
    <Web3Context.Provider value={{ 
      connector, 
      provider, 
      isBlockchainEnabled, 
      enableBlockchain,
      mockAddress 
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