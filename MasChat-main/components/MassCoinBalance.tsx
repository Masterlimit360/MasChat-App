import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { massCoinService, WalletInfo } from '../app/lib/services/massCoinService';
import { useAuth } from '../app/context/AuthContext';
import MassCoinIcon from './MassCoinIcon';

interface MassCoinBalanceProps {
  size?: 'small' | 'medium' | 'large';
  style?: any;
  showIcon?: boolean;
  clickable?: boolean;
}

export default function MassCoinBalance({
  size = 'medium',
  style,
  showIcon = true,
  clickable = true,
}: MassCoinBalanceProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadWallet();
    }
  }, [user?.id]);

  // Fallback to mock data if wallet is null
  const displayWallet = wallet || massCoinService.getMockWallet();

  const loadWallet = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const walletData = await massCoinService.getWallet(Number(user.id));
      setWallet(walletData);
    } catch (error: any) {
      // Don't show alerts for 404 errors, just use mock data
      if (error.response?.status !== 404) {
        console.error('Error loading wallet:', error);
      }
      setWallet(massCoinService.getMockWallet());
    } finally {
      setIsLoading(false);
    }
  };

  const handlePress = () => {
    if (clickable) {
      router.push('/screens/MassCoinDashboardScreen');
    }
  };

  const sizeStyles = {
    small: {
      container: { paddingHorizontal: 8, paddingVertical: 4 },
      text: { fontSize: 12 },
      icon: 16,
    },
    medium: {
      container: { paddingHorizontal: 12, paddingVertical: 6 },
      text: { fontSize: 14 },
      icon: 20,
    },
    large: {
      container: { paddingHorizontal: 16, paddingVertical: 8 },
      text: { fontSize: 16 },
      icon: 24,
    },
  };

  const currentSize = sizeStyles[size];

  if (isLoading && !wallet) {
    return (
      <View style={[styles.massCoinBalance, currentSize.container, style]}>
        <Text style={[styles.loadingText, currentSize.text]}>Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.massCoinBalance,
        currentSize.container,
        style,
        !clickable && styles.nonClickable
      ]}
      onPress={handlePress}
      disabled={!clickable}
    >
      {showIcon && (
        <MassCoinIcon size={currentSize.icon} style={styles.coinIcon} />
      )}
      <Text style={[styles.balanceText, currentSize.text]}>
        {massCoinService.formatAmount(displayWallet.balance)}
      </Text>
      {clickable && (
        <Ionicons name="chevron-forward" size={16} color="#FFD700" style={styles.chevron} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  massCoinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  nonClickable: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  coinIcon: {
    marginRight: 6,
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 4,
  },
  chevron: {
    marginLeft: 2,
  },
  loadingText: {
    color: '#FFD700',
    fontStyle: 'italic',
  },
}); 