import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, TransferRequestInfo } from '../lib/services/massCoinService';
import { useAuth } from '../context/AuthContext';

interface TransferRequestApprovalModalProps {
  visible: boolean;
  onClose: () => void;
  transferRequest: TransferRequestInfo;
  onSuccess?: () => void;
}

const TransferRequestApprovalModal: React.FC<TransferRequestApprovalModalProps> = ({
  visible,
  onClose,
  transferRequest,
  onSuccess
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const colors = {
    light: {
      background: '#FFFFFF',
      card: '#F8F9FA',
      text: '#212529',
      textSecondary: '#6C757D',
      border: '#E9ECEF',
      primary: '#4361EE',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    },
    dark: {
      background: '#1A1A2E',
      card: '#2D2D44',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      border: '#404040',
      primary: '#4361EE',
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B'
    }
  };

  const currentColors = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const handleApprove = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to approve transfers');
      return;
    }

    setLoading(true);
    setAction('approve');
    
    try {
      await massCoinService.approveTransferRequest(transferRequest.id, user.id);
      
      Alert.alert(
        'Transfer Approved',
        `You have approved the transfer of ${transferRequest.amount} Mass Coins from ${transferRequest.senderName}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error approving transfer request:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to approve transfer request. Please try again.'
      );
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleReject = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to reject transfers');
      return;
    }

    Alert.alert(
      'Reject Transfer',
      `Are you sure you want to reject the transfer of ${transferRequest.amount} Mass Coins from ${transferRequest.senderName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            setAction('reject');
            
            try {
              await massCoinService.rejectTransferRequest(transferRequest.id, user.id);
              
              Alert.alert(
                'Transfer Rejected',
                `You have rejected the transfer. The sender will be notified and their Mass Coins will be refunded.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      onSuccess?.();
                      onClose();
                    }
                  }
                ]
              );
            } catch (error: any) {
              console.error('Error rejecting transfer request:', error);
              Alert.alert(
                'Error',
                error.response?.data?.message || 'Failed to reject transfer request. Please try again.'
              );
            } finally {
              setLoading(false);
              setAction(null);
            }
          }
        }
      ]
    );
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  };

  const getContextLabel = (contextType: string) => {
    const labels: { [key: string]: string } = {
      'POST': 'Post',
      'REEL': 'Reel',
      'CHAT': 'Chat',
      'DIRECT': 'Direct Transfer',
      'MASS_COIN_SECTION': 'Mass Coin Section'
    };
    return labels[contextType] || contextType;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons 
                  name="wallet" 
                  size={24} 
                  color={currentColors.primary} 
                />
                <Text style={[styles.title, { color: currentColors.text }]}>
                  Transfer Request
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={currentColors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            {/* Transfer Details */}
            <View style={styles.transferDetails}>
              {/* Sender Info */}
              <View style={styles.senderInfo}>
                <View style={styles.avatarContainer}>
                  {transferRequest.senderAvatar ? (
                    <Image 
                      source={{ uri: transferRequest.senderAvatar }} 
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: currentColors.primary }]}>
                      <Ionicons name="person" size={20} color="#FFFFFF" />
                    </View>
                  )}
                </View>
                <View style={styles.senderDetails}>
                  <Text style={[styles.senderName, { color: currentColors.text }]}>
                    {transferRequest.senderName}
                  </Text>
                  <Text style={[styles.contextInfo, { color: currentColors.textSecondary }]}>
                    {getContextLabel(transferRequest.contextType)}
                  </Text>
                  <Text style={[styles.timeInfo, { color: currentColors.textSecondary }]}>
                    {formatTime(transferRequest.createdAt)}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View style={[styles.amountContainer, { backgroundColor: currentColors.background }]}>
                <Text style={[styles.amountLabel, { color: currentColors.textSecondary }]}>
                  Amount to Receive
                </Text>
                <Text style={[styles.amount, { color: currentColors.primary }]}>
                  {transferRequest.amount} Mass Coins
                </Text>
                <Text style={[styles.usdValue, { color: currentColors.textSecondary }]}>
                  ≈ ${(transferRequest.amount * 0.01).toFixed(2)} USD
                </Text>
              </View>

              {/* Message */}
              {transferRequest.message && (
                <View style={[styles.messageContainer, { backgroundColor: currentColors.background }]}>
                  <Text style={[styles.messageLabel, { color: currentColors.textSecondary }]}>
                    Message
                  </Text>
                  <Text style={[styles.messageText, { color: currentColors.text }]}>
                    {transferRequest.message}
                  </Text>
                </View>
              )}

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: 'rgba(67, 97, 238, 0.1)' }]}>
                <Ionicons 
                  name="information-circle" 
                  size={20} 
                  color={currentColors.primary} 
                />
                <Text style={[styles.infoText, { color: currentColors.textSecondary }]}>
                  This transfer request will expire in 7 days. You can approve or reject it.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[
                  styles.rejectButton,
                  {
                    borderColor: currentColors.error,
                    opacity: loading ? 0.6 : 1
                  }
                ]}
                onPress={handleReject}
                disabled={loading}
              >
                {loading && action === 'reject' ? (
                  <ActivityIndicator color={currentColors.error} size="small" />
                ) : (
                  <>
                    <Ionicons name="close" size={16} color={currentColors.error} />
                    <Text style={[styles.rejectButtonText, { color: currentColors.error }]}>
                      Reject
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.approveButton,
                  {
                    backgroundColor: currentColors.success,
                    opacity: loading ? 0.6 : 1
                  }
                ]}
                onPress={handleApprove}
                disabled={loading}
              >
                {loading && action === 'approve' ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    <Text style={styles.approveButtonText}>
                      Approve
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  transferDetails: {
    gap: 20
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.1)'
  },
  avatarContainer: {
    marginRight: 12
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  senderDetails: {
    flex: 1
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2
  },
  contextInfo: {
    fontSize: 14,
    marginBottom: 2
  },
  timeInfo: {
    fontSize: 12
  },
  amountContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center'
  },
  amountLabel: {
    fontSize: 14,
    marginBottom: 8
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4
  },
  usdValue: {
    fontSize: 14
  },
  messageContainer: {
    padding: 16,
    borderRadius: 12
  },
  messageLabel: {
    fontSize: 14,
    marginBottom: 8
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24
  },
  rejectButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  approveButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default TransferRequestApprovalModal; 