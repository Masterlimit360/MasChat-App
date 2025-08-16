import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, TransactionInfo } from '../lib/services/massCoinService';
import MassCoinIcon from '../../components/MassCoinIcon';

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

export default function MassCoinTransactionsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadTransactions();
    }
  }, [user?.id]);

  const loadTransactions = async (refresh = false) => {
    if (!user?.id) return;
    
    const currentPage = refresh ? 0 : page;
    
    try {
      const response = await massCoinService.getUserTransactions(Number(user.id), currentPage, 20);
      const newTransactions = response.content || [];
      
      if (refresh) {
        setTransactions(newTransactions);
        setPage(0);
      } else {
        setTransactions(prev => [...prev, ...newTransactions]);
        setPage(currentPage + 1);
      }
      
      setHasMore(!response.last);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTransactions(true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadTransactions();
    }
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
  };

  const formatUsdValue = (amount: number) => {
    return massCoinService.formatUsdValue(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderTransaction = ({ item }: { item: TransactionInfo }) => {
    const isOutgoing = item.senderId === Number(user?.id);
    const isIncoming = item.recipientId === Number(user?.id);
    
    return (
      <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionIcon}>
            <MassCoinIcon size={24} />
          </View>
          
          <View style={styles.transactionInfo}>
            <Text style={[styles.transactionType, { color: colors.text }]}>
              {massCoinService.getTransactionTypeLabel(item.transactionType)}
            </Text>
            <Text style={[styles.transactionDate, { color: colors.lightText }]}>
              {formatDate(item.createdAt)}
            </Text>
            {item.description && (
              <Text style={[styles.transactionDescription, { color: colors.lightText }]}>
                {item.description}
              </Text>
            )}
          </View>
          
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText,
              { color: isOutgoing ? '#ef4444' : isIncoming ? '#22c55e' : colors.text }
            ]}>
              {isOutgoing ? '-' : isIncoming ? '+' : ''}{formatAmount(item.amount)} MASS
            </Text>
            <Text style={[styles.usdValue, { color: colors.lightText }]}>
              ≈ {formatUsdValue(item.amount)}
            </Text>
          </View>
        </View>
        
        <View style={styles.transactionFooter}>
          <View style={[styles.statusBadge, { backgroundColor: massCoinService.getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {massCoinService.getStatusLabel(item.status)}
            </Text>
          </View>
          
          {item.transactionHash && (
            <Text style={[styles.hashText, { color: colors.lightText }]}>
              Hash: {item.transactionHash.substring(0, 8)}...{item.transactionHash.substring(-8)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MassCoinIcon size={64} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transactions Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>
        Your transaction history will appear here once you start sending or receiving MASS tokens.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) {
      return (
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.lightText }]}>
            No more transactions
          </Text>
        </View>
      );
    }
    
    if (loading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.primary} />
        </View>
      );
    }
    
    return null;
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading transactions...</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
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
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  transactionItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  transactionIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  usdValue: {
    fontSize: 12,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  hashText: {
    fontSize: 10,
    fontFamily: 'monospace',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
  },
}); 