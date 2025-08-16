import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, TransferRequest } from '../lib/services/massCoinService';
import { useAuth } from '../context/AuthContext';

interface MassCoinTransferModalProps {
  visible: boolean;
  onClose: () => void;
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
  contextType: 'POST' | 'REEL' | 'CHAT' | 'DIRECT' | 'MASS_COIN_SECTION';
  contextId?: string;
  onSuccess?: () => void;
}

const MassCoinTransferModal: React.FC<MassCoinTransferModalProps> = ({
  visible,
  onClose,
  recipientId,
  recipientName,
  recipientAvatar,
  contextType,
  contextId,
  onSuccess
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      inputBackground: '#F8F9FA'
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
      inputBackground: '#2D2D44'
    }
  };

  const currentColors = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const handleSendRequest = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to send Mass Coins');
      return;
    }

    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (numAmount > 1000) {
      Alert.alert('Error', 'Maximum transfer amount is 1000 Mass Coins');
      return;
    }

    setLoading(true);
    try {
      const transferRequest: TransferRequest = {
        recipientId: recipientId,
        amount: numAmount,
        message: message.trim() || undefined,
        contextType: contextType,
        contextId: contextId
      };

      await massCoinService.createTransferRequest(user.id, transferRequest);
      
      Alert.alert(
        'Transfer Request Sent',
        `Your request to send ${numAmount} Mass Coins to ${recipientName} has been sent. They will need to approve it.`,
        [
          {
            text: 'OK',
            onPress: () => {
              onSuccess?.();
              onClose();
              setAmount('');
              setMessage('');
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('Error sending transfer request:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send transfer request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setMessage('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContainer, { backgroundColor: currentColors.background }]}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.card }]}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: currentColors.text }]}>
                Send Mass Coins
              </Text>
              <TouchableOpacity onPress={handleClose} disabled={loading}>
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={currentColors.textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {/* Recipient Info */}
              <View style={styles.recipientInfo}>
                <View style={styles.recipientAvatar}>
                  <Ionicons 
                    name="person" 
                    size={24} 
                    color={currentColors.textSecondary} 
                  />
                </View>
                <View style={styles.recipientDetails}>
                  <Text style={[styles.recipientName, { color: currentColors.text }]}>
                    {recipientName}
                  </Text>
                  <Text style={[styles.contextInfo, { color: currentColors.textSecondary }]}>
                    {contextType === 'POST' && 'Post'}
                    {contextType === 'REEL' && 'Reel'}
                    {contextType === 'CHAT' && 'Chat'}
                    {contextType === 'DIRECT' && 'Direct Transfer'}
                    {contextType === 'MASS_COIN_SECTION' && 'Mass Coin Section'}
                  </Text>
                </View>
              </View>

              {/* Amount Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: currentColors.text }]}>
                  Amount (Mass Coins)
                </Text>
                <TextInput
                  style={[
                    styles.amountInput,
                    {
                      backgroundColor: currentColors.inputBackground,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }
                  ]}
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Enter amount"
                  placeholderTextColor={currentColors.textSecondary}
                  keyboardType="numeric"
                  editable={!loading}
                />
                <Text style={[styles.hint, { color: currentColors.textSecondary }]}>
                  Maximum: 1000 Mass Coins
                </Text>
              </View>

              {/* Message Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: currentColors.text }]}>
                  Message (Optional)
                </Text>
                <TextInput
                  style={[
                    styles.messageInput,
                    {
                      backgroundColor: currentColors.inputBackground,
                      color: currentColors.text,
                      borderColor: currentColors.border
                    }
                  ]}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Add a message..."
                  placeholderTextColor={currentColors.textSecondary}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                />
              </View>

              {/* Info Box */}
              <View style={[styles.infoBox, { backgroundColor: currentColors.background }]}>
                <Ionicons 
                  name="information-circle" 
                  size={20} 
                  color={currentColors.primary} 
                />
                <Text style={[styles.infoText, { color: currentColors.textSecondary }]}>
                  The recipient will need to approve this transfer request. If they reject it, your Mass Coins will be refunded.
                </Text>
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: currentColors.border }]}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={[styles.cancelButtonText, { color: currentColors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  {
                    backgroundColor: currentColors.primary,
                    opacity: loading ? 0.6 : 1
                  }
                ]}
                onPress={handleSendRequest}
                disabled={loading || !amount.trim()}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={16} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>Send Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    flex: 1
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.1)'
  },
  recipientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(67, 97, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  recipientDetails: {
    flex: 1
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  contextInfo: {
    fontSize: 14
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8
  },
  amountInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 4
  },
  messageInput: {
    height: 80,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top'
  },
  hint: {
    fontSize: 12,
    marginTop: 4
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20
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
    marginTop: 20
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600'
  },
  sendButton: {
    flex: 2,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF'
  }
});

export default MassCoinTransferModal; 