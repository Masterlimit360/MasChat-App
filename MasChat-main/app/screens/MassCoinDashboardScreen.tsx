import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, WalletInfo, TransactionInfo, UserStats, WithdrawalInfo } from '../lib/services/massCoinService';
import MassCoinIcon from '../../components/MassCoinIcon';
import MassCoinSendButton from '../../components/MassCoinSendButton';

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
    dark: '#1A1A2E',
    tabBarBg: 'rgba(255, 255, 255, 0.95)',
    tabBarBorder: 'rgba(0, 0, 0, 0.1)',
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
    dark: '#1A1A2E',
    tabBarBg: 'rgba(26, 26, 46, 0.95)',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
  },
};

export default function MassCoinDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [recipientId, setRecipientId] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState<'BANK' | 'MOBILE_MONEY' | 'P2P'>('BANK');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  const [withdrawals, setWithdrawals] = useState<WithdrawalInfo[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const [walletData, transactionsData, statsData, withdrawalsData] = await Promise.all([
        massCoinService.getWallet(Number(user.id)),
        massCoinService.getUserTransactions(Number(user.id), 0, 10),
        massCoinService.getUserStats(Number(user.id)),
        massCoinService.getWithdrawals(Number(user.id))
      ]);
      
      setWallet(walletData);
      setTransactions(transactionsData.content || []);
      setStats(statsData);
      setWithdrawals(withdrawalsData || []);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert('Wallet not found', 'No wallet exists for your account. Please contact support.');
      } else {
        console.error('Error loading Mass Coin data:', error);
        Alert.alert('Error', 'Failed to load Mass Coin data.');
      }
      setWallet(massCoinService.getMockWallet());
      setTransactions(massCoinService.getMockTransactions());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSendTokens = async () => {
    if (!user?.id || !recipientId || !amount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    try {
      const transferRequest = {
        recipientId: Number(recipientId),
        amount: numAmount,
        message: message.trim() || undefined,
        contextType: 'MASS_COIN_SECTION' as const,
        transactionType: 'P2P_TRANSFER' as const,
      };

      await massCoinService.transferMass(Number(user.id), transferRequest);
      
      Alert.alert('Success!', `Successfully sent ${massCoinService.formatAmount(numAmount)} MASS`);
      setShowSendModal(false);
      setRecipientId('');
      setAmount('');
      setMessage('');
      loadData(); // Refresh data
    } catch (error: any) {
      console.error('Error sending tokens:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send tokens. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    if (!user?.id || !amount || !withdrawDestination) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    try {
      await massCoinService.requestWithdrawal({
        userId: Number(user.id),
        amount: numAmount,
        method: withdrawMethod,
        destination: withdrawDestination,
      });

      Alert.alert('Withdrawal requested', 'Your withdrawal request has been submitted.');
      setShowWithdrawModal(false);
      setAmount('');
      setWithdrawDestination('');
      onRefresh();
    } catch (error: any) {
      console.error('Error requesting withdrawal:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to request withdrawal.');
    }
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
  };

  const formatUsdValue = (amount: number) => {
    return massCoinService.formatUsdValue(amount);
  };

  const renderTransaction = ({ item }: { item: TransactionInfo }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionType, { color: colors.text }]}>
            {massCoinService.getTransactionTypeLabel(item.transactionType)}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.lightText }]}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text style={[styles.amountText, { color: colors.text }]}>
            {item.senderId === Number(user?.id) ? '-' : '+'}{formatAmount(item.amount)} MASS
          </Text>
          <Text style={[styles.usdValue, { color: colors.lightText }]}>
            ≈ {formatUsdValue(item.amount)}
          </Text>
        </View>
      </View>
      
      {item.description && (
        <Text style={[styles.transactionDescription, { color: colors.lightText }]}>
          {item.description}
        </Text>
      )}
      
      <View style={styles.transactionFooter}>
        <View style={[styles.statusBadge, { backgroundColor: massCoinService.getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>
            {massCoinService.getStatusLabel(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Mass Coin</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading wallet...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mass Coin</Text>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={() => setShowWithdrawModal(true)} style={styles.sendButton}>
            <Ionicons name="cash-outline" size={24} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowSendModal(true)} style={styles.sendButton}>
            <Ionicons name="send" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Wallet Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.card }]}>
          <LinearGradient
            colors={['#FFD700', '#FFA500', '#FFD700']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.balanceGradient}
          >
            <View style={styles.coinIconContainer}>
              <MassCoinIcon size={48} />
            </View>
            <Text style={styles.totalBalanceLabel}>Total Balance</Text>
            <Text style={styles.totalBalanceAmount}>
              {wallet ? formatAmount(wallet.balance + wallet.stakedAmount) : '0.00'} MASS
            </Text>
            <Text style={styles.totalBalanceUsd}>
              ≈ {wallet ? formatUsdValue(wallet.balance + wallet.stakedAmount) : '$0.00'}
            </Text>
          </LinearGradient>
        </View>

        {/* Wallet Details */}
        <View style={[styles.walletDetails, { backgroundColor: colors.card }]}>
          <View style={styles.walletDetailItem}>
            <View style={styles.detailHeader}>
              <Ionicons name="wallet" size={20} color={colors.primary} />
              <Text style={[styles.detailLabel, { color: colors.text }]}>Available Balance</Text>
            </View>
            <Text style={[styles.detailAmount, { color: colors.text }]}>
              {wallet ? formatAmount(wallet.balance) : '0.00'} MASS
            </Text>
          </View>

          <View style={styles.walletDetailItem}>
            <View style={styles.detailHeader}>
              <Ionicons name="trending-up" size={20} color={colors.success} />
              <Text style={[styles.detailLabel, { color: colors.text }]}>Staked Amount</Text>
            </View>
            <Text style={[styles.detailAmount, { color: colors.text }]}>
              {wallet ? formatAmount(wallet.stakedAmount) : '0.00'} MASS
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActions, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/screens/MassCoinSendScreen')}>
            <Ionicons name="send" size={24} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setShowWithdrawModal(true)}>
            <Ionicons name="cash-outline" size={24} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>Withdraw</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/screens/MassCoinTransactionsScreen')}>
            <Ionicons name="list" size={24} color={colors.success} />
            <Text style={[styles.actionText, { color: colors.text }]}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/screens/MassCoinTransferRequestsScreen')}>
            <Ionicons name="swap-horizontal" size={24} color={colors.accent} />
            <Text style={[styles.actionText, { color: colors.text }]}>Requests</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={[styles.transactionsSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <FlatList
              data={transactions}
              renderItem={renderTransaction}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={48} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>No transactions yet</Text>
            </View>
          )}
        </View>

        {/* Recent Withdrawals */}
        <View style={[styles.transactionsSection, { backgroundColor: colors.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Withdrawals</Text>
          </View>
          {withdrawals.length > 0 ? (
            <FlatList
              data={withdrawals}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View style={[styles.transactionItem, { backgroundColor: colors.card }]}> 
                  <View style={styles.transactionHeader}>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionType, { color: colors.text }]}>Withdrawal ({item.method})</Text>
                      <Text style={[styles.transactionDate, { color: colors.lightText }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={[styles.amountText, { color: colors.text }]}>-{formatAmount(item.amount)} MASS</Text>
                    </View>
                  </View>
                  <View style={styles.transactionFooter}>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'COMPLETED' ? '#22c55e' : item.status === 'FAILED' ? '#ef4444' : '#fbbf24' }]}>
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </View>
              )}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="wallet-outline" size={48} color={colors.lightText} />
              <Text style={[styles.emptyText, { color: colors.lightText }]}>No withdrawals yet</Text>
            </View>
          )}
        </View>

        {/* Staking Info */}
        <View style={[styles.stakingCard, { backgroundColor: colors.card }]}>
          <View style={styles.stakingHeader}>
            <Ionicons name="trending-up" size={24} color={colors.success} />
            <Text style={[styles.stakingTitle, { color: colors.text }]}>Staking Rewards</Text>
          </View>
          <Text style={[styles.stakingDescription, { color: colors.lightText }]}>
            Earn up to 15% APY by staking your MASS tokens
          </Text>
          <View style={styles.stakingStats}>
            <Text style={[styles.stakingAmount, { color: colors.text }]}>
              {wallet ? formatAmount(wallet.stakedAmount) : '0.00'}
            </Text>
            <Text style={[styles.stakingLabel, { color: colors.lightText }]}>MASS Staked</Text>
          </View>
        </View>
      </ScrollView>

      {/* Send Modal */}
      <Modal
        visible={showSendModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Send MASS Tokens</Text>
              <TouchableOpacity onPress={() => setShowSendModal(false)}>
                <Ionicons name="close" size={24} color={colors.lightText} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Recipient ID</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={recipientId}
                onChangeText={setRecipientId}
                placeholder="Enter user ID"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Amount (MASS)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={message}
                onChangeText={setMessage}
                placeholder="Add a message..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButtonLarge, { backgroundColor: colors.primary }]}
              onPress={handleSendTokens}
            >
              <MassCoinIcon size={20} />
              <Text style={styles.sendButtonText}>Send Tokens</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Withdraw MASS</Text>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Ionicons name="close" size={24} color={colors.lightText} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Amount (MASS)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Method</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {(['BANK', 'MOBILE_MONEY', 'P2P'] as const).map((m) => (
                  <TouchableOpacity key={m} onPress={() => setWithdrawMethod(m)} style={{ padding: 8, borderWidth: 1, borderColor: withdrawMethod === m ? colors.primary : colors.border, borderRadius: 8 }}>
                    <Text style={{ color: colors.text }}>{m.replace('_', ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {withdrawMethod === 'BANK' ? 'Bank Account / IBAN' : withdrawMethod === 'MOBILE_MONEY' ? 'Mobile Money Wallet' : 'Peer Username / ID'}
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={withdrawDestination}
                onChangeText={setWithdrawDestination}
                placeholder={withdrawMethod === 'BANK' ? 'Enter bank account/IBAN' : withdrawMethod === 'MOBILE_MONEY' ? 'Enter MoMo number' : 'Enter peer handle'}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButtonLarge, { backgroundColor: colors.accent }]}
              onPress={handleWithdraw}
            >
              <Ionicons name="cash-outline" size={20} color="#fff" />
              <Text style={styles.sendButtonText}>Request Withdrawal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40,
  },
  sendButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  balanceGradient: {
    padding: 24,
    alignItems: 'center',
  },
  coinIconContainer: {
    marginBottom: 16,
  },
  totalBalanceLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalBalanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  totalBalanceUsd: {
    fontSize: 16,
    color: '#666',
  },
  walletDetails: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  walletDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  detailAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActions: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionText: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 14,
  },
  transactionItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  usdValue: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionDescription: {
    fontSize: 12,
    marginTop: 8,
  },
  transactionFooter: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  stakingCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  stakingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stakingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  stakingDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  stakingStats: {
    alignItems: 'center',
  },
  stakingAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  stakingLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  sendButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  sendButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
}); 