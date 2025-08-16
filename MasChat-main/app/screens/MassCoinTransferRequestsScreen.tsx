import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, TransferRequestInfo } from '../lib/services/massCoinService';
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

export default function MassCoinTransferRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  
  const [requests, setRequests] = useState<TransferRequestInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingRequest, setProcessingRequest] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadRequests();
    }
  }, [user?.id]);

  const loadRequests = async () => {
    if (!user?.id) return;
    
    try {
      const data = await massCoinService.getTransferRequests(Number(user.id));
      setRequests(data);
    } catch (error) {
      console.error('Error loading transfer requests:', error);
      Alert.alert('Error', 'Failed to load transfer requests.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
  };

  const handleApprove = async (requestId: number) => {
    if (!user?.id) return;
    
    setProcessingRequest(requestId);
    try {
      await massCoinService.approveTransferRequest(requestId, Number(user.id));
      Alert.alert('Success', 'Transfer request approved successfully!');
      loadRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      Alert.alert('Error', 'Failed to approve transfer request.');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId: number) => {
    if (!user?.id) return;
    
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this transfer request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setProcessingRequest(requestId);
            try {
              await massCoinService.rejectTransferRequest(requestId, Number(user.id));
              Alert.alert('Success', 'Transfer request rejected.');
              loadRequests(); // Refresh the list
            } catch (error) {
              console.error('Error rejecting request:', error);
              Alert.alert('Error', 'Failed to reject transfer request.');
            } finally {
              setProcessingRequest(null);
            }
          }
        }
      ]
    );
  };

  const formatAmount = (amount: number) => {
    return massCoinService.formatAmount(amount);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '#fbbf24';
      case 'APPROVED':
        return '#22c55e';
      case 'REJECTED':
        return '#ef4444';
      case 'EXPIRED':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'EXPIRED':
        return 'Expired';
      default:
        return status;
    }
  };

  const renderRequest = ({ item }: { item: TransferRequestInfo }) => {
    const isIncoming = item.recipientId === Number(user?.id);
    const isOutgoing = item.senderId === Number(user?.id);
    
    return (
      <View style={[styles.requestItem, { backgroundColor: colors.card }]}>
        <View style={styles.requestHeader}>
          <View style={styles.requestIcon}>
            <MassCoinIcon size={24} />
          </View>
          
          <View style={styles.requestInfo}>
            <Text style={[styles.requestType, { color: colors.text }]}>
              {isIncoming ? 'Incoming Request' : 'Outgoing Request'}
            </Text>
            <Text style={[styles.requestUser, { color: colors.text }]}>
              {isIncoming ? item.senderName : item.recipientName}
            </Text>
            <Text style={[styles.requestDate, { color: colors.lightText }]}>
              {formatDate(item.createdAt)}
            </Text>
            {item.message && (
              <Text style={[styles.requestMessage, { color: colors.lightText }]}>
                "{item.message}"
              </Text>
            )}
          </View>
          
          <View style={styles.requestAmount}>
            <Text style={[styles.amountText, { color: colors.text }]}>
              {formatAmount(item.amount)} MASS
            </Text>
            <Text style={[styles.usdValue, { color: colors.lightText }]}>
              ≈ {massCoinService.formatUsdValue(item.amount)}
            </Text>
          </View>
        </View>
        
        <View style={styles.requestFooter}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
          
          {isIncoming && item.status === 'PENDING' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleApprove(item.id)}
                disabled={processingRequest === item.id}
              >
                {processingRequest === item.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id)}
                disabled={processingRequest === item.id}
              >
                {processingRequest === item.id ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="close" size={16} color="white" />
                    <Text style={styles.actionButtonText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MassCoinIcon size={64} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Transfer Requests</Text>
      <Text style={[styles.emptySubtitle, { color: colors.lightText }]}>
        You don't have any pending transfer requests at the moment.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transfer Requests</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.lightText }]}>Loading requests...</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Transfer Requests</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
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
  requestItem: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  requestIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  requestInfo: {
    flex: 1,
  },
  requestType: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  requestAmount: {
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
  requestFooter: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  approveButton: {
    backgroundColor: '#22c55e',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
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
}); 