import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { massCoinService, WalletInfo } from '../lib/services/massCoinService';
import ModernHeader from '../../components/ModernHeader';

// Color Palette
const COLORS = {
  light: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#F8F9FA',
    card: '#FFFFFF',
    text: '#212529',
    lightText: '#6C757D',
    border: '#E9ECEF',
    success: '#4CC9F0',
    error: '#F44336',
    dark: '#1A1A2E',
    gold: '#FFD700',
  },
  dark: {
    primary: '#4361EE',
    secondary: '#3A0CA3',
    accent: '#FF7F11',
    background: '#1A1A2E',
    card: '#2D2D44',
    text: '#FFFFFF',
    lightText: '#B0B0B0',
    border: '#404040',
    success: '#4CC9F0',
    error: '#F44336',
    dark: '#1A1A2E',
    gold: '#FFD700',
  },
};

export default function StakingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState<'stake' | 'unstake'>('stake');
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadWallet();
    }
  }, [user?.id]);

  const loadWallet = async () => {
    try {
      setWalletLoading(true);
      const walletData = await massCoinService.getWallet(Number(user.id));
      setWallet(walletData);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert('Wallet not found', 'No wallet exists for your account. Please contact support.');
      } else {
        console.error('Error loading wallet:', error);
        Alert.alert('Error', 'Failed to load wallet.');
      }
      setWallet(massCoinService.getMockWallet());
    } finally {
      setWalletLoading(false);
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (wallet && parseFloat(amount) > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Staking',
      `Stake ${amount} MASS?\n\nYou will earn 15% APY on staked tokens.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Stake', style: 'default', onPress: confirmStake }
      ]
    );
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (wallet && parseFloat(amount) > wallet.stakedAmount) {
      Alert.alert('Error', 'Insufficient staked amount');
      return;
    }

    Alert.alert(
      'Confirm Unstaking',
      `Unstake ${amount} MASS?\n\nThis will stop earning rewards on the unstaked amount.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Unstake', style: 'destructive', onPress: confirmUnstake }
      ]
    );
  };

  const confirmStake = async () => {
    try {
      setLoading(true);
      const updatedWallet = await massCoinService.stakeMass(parseFloat(amount));
      setWallet(updatedWallet);
      setAmount('');
      
      Alert.alert(
        'Success',
        `Successfully staked ${amount} MASS`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error staking MASS:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to stake MASS');
    } finally {
      setLoading(false);
    }
  };

  const confirmUnstake = async () => {
    try {
      setLoading(true);
      const updatedWallet = await massCoinService.unstakeMass(parseFloat(amount));
      setWallet(updatedWallet);
      setAmount('');
      
      Alert.alert(
        'Success',
        `Successfully unstaked ${amount} MASS`,
        [{ text: 'OK' }]
      );
    } catch (error: any) {
      console.error('Error unstaking MASS:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to unstake MASS');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
  };

  const formatUsdValue = (amount: number) => {
    return massCoinService.formatUsdValue(amount);
  };

  const getEstimatedRewards = () => {
    if (!amount || parseFloat(amount) <= 0) return '0.00';
    const annualReward = parseFloat(amount) * 0.15; // 15% APY
    const dailyReward = annualReward / 365;
    return formatAmount(dailyReward);
  };

  if (walletLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader
          title="Staking"
          showBackButton={true}
          onBack={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader
        title="Staking"
        showBackButton={true}
        onBack={() => router.back()}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Staking Overview Card */}
          <View style={[styles.overviewCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.success, '#2E8B57']}
              style={styles.overviewGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.overviewHeader}>
                <FontAwesome name="lock" size={24} color="white" />
                <Text style={styles.overviewTitle}>Staking Rewards</Text>
              </View>
              <Text style={styles.apyText}>15% APY</Text>
              <Text style={styles.overviewSubtitle}>Earn daily rewards on staked tokens</Text>
            </LinearGradient>
          </View>

          {/* Balance Stats */}
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.statHeader}>
                <Ionicons name="wallet" size={20} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Available</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {wallet ? formatAmount(wallet.balance) : '0.00'} MASS
              </Text>
              <Text style={[styles.statUsd, { color: colors.lightText }]}>
                ≈ {wallet ? formatUsdValue(wallet.balance) : '$0.00'}
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={styles.statHeader}>
                <FontAwesome name="lock" size={20} color={colors.success} />
                <Text style={[styles.statLabel, { color: colors.lightText }]}>Staked</Text>
              </View>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {wallet ? formatAmount(wallet.stakedAmount) : '0.00'} MASS
              </Text>
              <Text style={[styles.statUsd, { color: colors.lightText }]}>
                ≈ {wallet ? formatUsdValue(wallet.stakedAmount) : '$0.00'}
              </Text>
            </View>
          </View>

          {/* Action Tabs */}
          <View style={styles.actionTabs}>
            <TouchableOpacity
              style={[styles.actionTab, action === 'stake' && { backgroundColor: colors.primary }]}
              onPress={() => setAction('stake')}
            >
              <Ionicons 
                name="arrow-up" 
                size={20} 
                color={action === 'stake' ? 'white' : colors.text} 
              />
              <Text style={[styles.actionTabText, { color: action === 'stake' ? 'white' : colors.text }]}>
                Stake
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionTab, action === 'unstake' && { backgroundColor: colors.primary }]}
              onPress={() => setAction('unstake')}
            >
              <Ionicons 
                name="arrow-down" 
                size={20} 
                color={action === 'unstake' ? 'white' : colors.text} 
              />
              <Text style={[styles.actionTabText, { color: action === 'unstake' ? 'white' : colors.text }]}>
                Unstake
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>
              {action === 'stake' ? 'Stake MASS' : 'Unstake MASS'}
            </Text>
            
            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="monetization-on" size={20} color={colors.lightText} />
                <Text style={[styles.inputLabel, { color: colors.lightText }]}>
                  Amount (MASS)
                </Text>
              </View>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text, 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }]}
                placeholder="0.00"
                placeholderTextColor={colors.lightText}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              
              {/* Max Button */}
              <TouchableOpacity
                style={[styles.maxButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  if (action === 'stake' && wallet) {
                    setAmount(wallet.balance.toString());
                  } else if (action === 'unstake' && wallet) {
                    setAmount(wallet.stakedAmount.toString());
                  }
                }}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>

            {/* Estimated Rewards (for staking) */}
            {action === 'stake' && (
              <View style={styles.rewardsContainer}>
                <Text style={[styles.rewardsLabel, { color: colors.lightText }]}>
                  Estimated Daily Rewards:
                </Text>
                <Text style={[styles.rewardsValue, { color: colors.success }]}>
                  {getEstimatedRewards()} MASS
                </Text>
              </View>
            )}

            {/* Action Button */}
            <TouchableOpacity
              style={[styles.actionButton, loading && styles.disabledButton]}
              onPress={action === 'stake' ? handleStake : handleUnstake}
              disabled={loading || !amount || parseFloat(amount) <= 0}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : [colors.primary, colors.secondary]}
                style={styles.actionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons 
                      name={action === 'stake' ? 'arrow-up' : 'arrow-down'} 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.actionButtonText}>
                      {action === 'stake' ? 'Stake MASS' : 'Unstake MASS'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Staking Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.lightText }]}>
              • Earn 15% APY on staked tokens{'\n'}
              • Rewards are distributed daily{'\n'}
              • You can unstake at any time{'\n'}
              • Minimum stake amount: 1 MASS{'\n'}
              • No lock-up period
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  overviewCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overviewGradient: {
    padding: 24,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  apyText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginLeft: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statUsd: {
    fontSize: 12,
  },
  actionTabs: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  actionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  maxButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  maxButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rewardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 201, 240, 0.1)',
  },
  rewardsLabel: {
    fontSize: 14,
  },
  rewardsValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
}); 