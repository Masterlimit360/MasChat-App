import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { massCoinService } from '../app/lib/services/massCoinService';
import { useAuth } from '../app/context/AuthContext';
import MassCoinIcon from './MassCoinIcon';

interface MassCoinSendButtonProps {
  recipientId: string;
  recipientName: string;
  contextType: 'POST' | 'REEL' | 'CHAT' | 'DIRECT' | 'MASS_COIN_SECTION';
  contextId?: string;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
}

export default function MassCoinSendButton({
  recipientId,
  recipientName,
  contextType,
  contextId,
  style,
  size = 'medium',
  variant = 'button',
}: MassCoinSendButtonProps) {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sizeStyles = {
    small: {
      container: { paddingHorizontal: 8, paddingVertical: 4 },
      icon: 16,
      text: { fontSize: 12 },
    },
    medium: {
      container: { paddingHorizontal: 12, paddingVertical: 6 },
      icon: 20,
      text: { fontSize: 14 },
    },
    large: {
      container: { paddingHorizontal: 16, paddingVertical: 8 },
      icon: 24,
      text: { fontSize: 16 },
    },
  };

  const currentSize = sizeStyles[size];

  const handleSend = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to send tokens.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      const transferRequest = {
        recipientId: Number(recipientId),
        amount: numAmount,
        message: message.trim() || undefined,
        contextType,
        contextId,
        transactionType: 'P2P_TRANSFER' as const,
      };

      await massCoinService.transferMass(Number(user.id), transferRequest);
      
      Alert.alert(
        'Success!',
        `Successfully sent ${massCoinService.formatAmount(numAmount)} MASS to ${recipientName}`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
      
      setAmount('');
      setMessage('');
    } catch (error: any) {
      console.error('Error sending tokens:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [10, 25, 50, 100];

  return (
    <>
      {variant === 'icon' ? (
        <TouchableOpacity
          style={[styles.iconOnlyButton, style]}
          onPress={() => setModalVisible(true)}
        >
          <MassCoinIcon size={currentSize.icon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.sendButton, currentSize.container, style]}
          onPress={() => setModalVisible(true)}
        >
          <MassCoinIcon size={currentSize.icon} />
          <Text style={[styles.sendText, currentSize.text]}>Send MASS</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send MASS Tokens</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.recipientInfo}>
              <Text style={styles.recipientLabel}>To:</Text>
              <Text style={styles.recipientName}>{recipientName}</Text>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount (MASS)</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="numeric"
                autoFocus
              />
              
              <View style={styles.quickAmounts}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmount(quickAmount.toString())}
                  >
                    <Text style={styles.quickAmountText}>{quickAmount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.messageSection}>
              <Text style={styles.messageLabel}>Message (Optional)</Text>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Add a message..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendButtonLarge, isLoading && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.sendButtonText}>Sending...</Text>
              ) : (
                <>
                  <MassCoinIcon size={20} />
                  <Text style={styles.sendButtonText}>Send Tokens</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  iconOnlyButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 215, 0, 0.12)'
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  sendText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#FFD700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
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
    color: '#333',
  },
  recipientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  recipientLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  amountSection: {
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    flex: 1,
    padding: 8,
    marginHorizontal: 4,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    alignItems: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  messageSection: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  sendButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
}); 