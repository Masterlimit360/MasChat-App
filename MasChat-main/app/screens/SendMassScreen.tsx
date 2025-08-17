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
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { massCoinService, WalletInfo, TransferRequestInfo } from '../lib/services/massCoinService';
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

export default function SendMassScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
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
      if (!user?.id) return;
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

  const handleSend = async () => {
    if (!recipientId.trim()) {
      Alert.alert('Error', 'Please enter recipient ID');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (wallet && wallet.balance != null && parseFloat(amount) > (wallet.balance || 0)) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Send ${amount} MASS to ${recipientId}?\n\nThis action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Send', style: 'destructive', onPress: confirmSend }
      ]
    );
  };

  const confirmSend = async () => {
    try {
      setLoading(true);
      
      const transferRequest = {
        recipientId: recipientId.trim(),
        amount: parseFloat(amount),
        description: description.trim() || undefined,
        transactionType: 'P2P_TRANSFER'
      };

      const transaction = await massCoinService.transferMass(Number(user?.id), transferRequest);
      
      Alert.alert(
        'Success',
        `Successfully sent ${amount} MASS to ${recipientId}`,
        [
          { text: 'OK', onPress: () => router.back() }
        ]
      );
    } catch (error: any) {
      console.error('Error sending MASS:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to send MASS');
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

  const getEstimatedUsdValue = () => {
    if (!amount || parseFloat(amount) <= 0) return '$0.00';
    return formatUsdValue(parseFloat(amount));
  };

  if (walletLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader
          title="Send MASS"
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
        title="Send MASS"
        showBackButton={true}
        onBack={() => router.back()}
      />
      
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Balance Card */}
          <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.balanceGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.balanceHeader}>
                <MaterialIcons name="monetization-on" size={24} color={colors.gold} />
                <Text style={styles.balanceLabel}>Available Balance</Text>
              </View>
              <Text style={styles.balanceAmount}>
                {wallet ? formatAmount(wallet.balance || 0) : '0.00'} MASS
              </Text>
              <Text style={styles.balanceUsd}>
                ≈ {wallet ? formatUsdValue(wallet.balance) : '$0.00'}
              </Text>
            </LinearGradient>
          </View>

          {/* Transfer Form */}
          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Transfer Details</Text>
            
            {/* Recipient Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="person" size={20} color={colors.lightText} />
                <Text style={[styles.inputLabel, { color: colors.lightText }]}>Recipient ID</Text>
              </View>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text, 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }]}
                placeholder="Enter recipient's user ID"
                placeholderTextColor={colors.lightText}
                value={recipientId}
                onChangeText={setRecipientId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Amount Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <MaterialIcons name="monetization-on" size={20} color={colors.lightText} />
                <Text style={[styles.inputLabel, { color: colors.lightText }]}>Amount (MASS)</Text>
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
              <Text style={[styles.usdEstimate, { color: colors.lightText }]}>
                ≈ {getEstimatedUsdValue()}
              </Text>
            </View>

            {/* Description Input */}
            <View style={styles.inputContainer}>
              <View style={styles.inputLabelContainer}>
                <Ionicons name="document-text" size={20} color={colors.lightText} />
                <Text style={[styles.inputLabel, { color: colors.lightText }]}>Description (Optional)</Text>
              </View>
              <TextInput
                style={[styles.textInput, { 
                  color: colors.text, 
                  backgroundColor: colors.background,
                  borderColor: colors.border 
                }]}
                placeholder="Add a note about this transfer"
                placeholderTextColor={colors.lightText}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendButton, loading && styles.disabledButton]}
              onPress={handleSend}
              disabled={loading || !recipientId.trim() || !amount || parseFloat(amount) <= 0}
            >
              <LinearGradient
                colors={loading ? ['#ccc', '#ccc'] : [colors.primary, colors.secondary]}
                style={styles.sendButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="white" />
                    <Text style={styles.sendButtonText}>Send MASS</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Transfer Information</Text>
            </View>
            <Text style={[styles.infoText, { color: colors.lightText }]}>
              • Transfers are instant and irreversible{'\n'}
              • Gas fees are covered by MasChat{'\n'}
              • Minimum transfer amount: 0.001 MASS{'\n'}
              • Maximum transfer amount: Your available balance
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
  balanceCard: {
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 20,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  balanceUsd: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
  usdEstimate: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  sendButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  sendButtonText: {
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