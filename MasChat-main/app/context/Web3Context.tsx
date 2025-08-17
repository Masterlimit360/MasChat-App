import React, { createContext, useContext, useState } from 'react';
import WalletConnectProvider, { useWalletConnect } from '@walletconnect/react-native-dapp';
import { ethers } from 'ethers';

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const connector = useWalletConnect();
  const [provider, setProvider] = useState(null);

  React.useEffect(() => {
    if (connector && connector.connected) {
      setProvider(new ethers.providers.Web3Provider(connector));
    }
  }, [connector]);

  return (
    <Web3Context.Provider value={{ connector, provider }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  return useContext(Web3Context);
}