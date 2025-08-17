import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { ethers } from 'ethers';
import web3Service from '../app/lib/services/web3Service';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletConnect({ onConnect, onDisconnect }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    setIsLoading(true);
    try {
      // For React Native, we'll use a different approach
      // This is a simplified version - you may need to integrate with WalletConnect or other mobile wallets
      
      // Check if we're in a web environment
      if (typeof window !== 'undefined' && window.ethereum) {
        // Web environment with MetaMask
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
          const success = await web3Service.initialize(window.ethereum);
          if (success) {
            const userAddress = await web3Service.getAddress();
            setAddress(userAddress);
            setIsConnected(true);
            onConnect?.(userAddress);
          }
        }
      } else {
        // React Native environment
        // For now, we'll show a message about mobile wallet integration
        Alert.alert(
          'Mobile Wallet Integration',
          'Mobile wallet integration requires additional setup. Please use the web version or integrate with WalletConnect.',
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
        
        // TODO: Implement proper mobile wallet integration
        // This would typically involve:
        // 1. WalletConnect integration
        // 2. Deep linking to mobile wallets
        // 3. QR code scanning for wallet connection
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      Alert.alert('Connection failed', error.message || 'Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    try {
      web3Service.disconnect();
      setAddress('');
      setIsConnected(false);
      onDisconnect?.();
    } catch (error) {
      console.error('Wallet disconnection failed:', error);
    }
  };

  const getShortAddress = (addr: string) => {
    if (addr.length < 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <View style={styles.container}>
      {!isConnected ? (
        <TouchableOpacity 
          style={[styles.button, styles.connectButton]} 
          onPress={connectWallet}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.connectedContainer}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressLabel}>Connected:</Text>
            <Text style={styles.addressText}>{getShortAddress(address)}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.button, styles.disconnectButton]} 
            onPress={disconnectWallet}
          >
            <Text style={styles.buttonText}>Disconnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  disconnectButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  connectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

