import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { massCoinService } from '../app/lib/services/massCoinService';
import { useAuth } from '../app/context/AuthContext';
import MassCoinIcon from './MassCoinIcon';

interface MassCoinTipButtonProps {
  postId: string;
  creatorId: string;
  creatorName: string;
  style?: any;
  size?: 'small' | 'medium' | 'large';
}

export default function MassCoinTipButton({
  postId,
  creatorId,
  creatorName,
  style,
  size = 'medium',
}: MassCoinTipButtonProps) {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sizeStyles = {
    small: {
      container: { paddingHorizontal: 6, paddingVertical: 3 },
      icon: 14,
      text: { fontSize: 11 },
    },
    medium: {
      container: { paddingHorizontal: 8, paddingVertical: 4 },
      icon: 16,
      text: { fontSize: 12 },
    },
    large: {
      container: { paddingHorizontal: 12, paddingVertical: 6 },
      icon: 20,
      text: { fontSize: 14 },
    },
  };

  const currentSize = sizeStyles[size];

  const handleTip = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to tip creators.');
      return;
    }

    if (user.id === creatorId) {
      Alert.alert('Error', 'You cannot tip yourself.');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setIsLoading(true);
    try {
      await massCoinService.tipCreator(
        Number(user.id),
        postId,
        numAmount,
        message.trim() || undefined
      );
      
      Alert.alert(
        'Tip Sent!',
        `Successfully tipped ${massCoinService.formatAmount(numAmount)} MASS to ${creatorName}`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
      
      setAmount('');
      setMessage('');
    } catch (error: any) {
      console.error('Error tipping creator:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send tip. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickAmounts = [5, 10, 25, 50];

  return (
    <>
      <TouchableOpacity
        style={[styles.tipButton, currentSize.container, style]}
        onPress={() => setModalVisible(true)}
      >
        <MassCoinIcon size={currentSize.icon} />
        <Text style={[styles.tipText, currentSize.text]}>Tip</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Tip Creator</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.creatorInfo}>
              <Text style={styles.creatorLabel}>To:</Text>
              <Text style={styles.creatorName}>{creatorName}</Text>
            </View>

            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Tip Amount (MASS)</Text>
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
                placeholder="Show your appreciation..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.tipButtonLarge, isLoading && styles.tipButtonDisabled]}
              onPress={handleTip}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.tipButtonText}>Sending Tip...</Text>
              ) : (
                <>
                  <MassCoinIcon size={18} />
                  <Text style={styles.tipButtonText}>Send Tip</Text>
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
  tipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  tipText: {
    marginLeft: 4,
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
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  creatorLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  creatorName: {
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
  tipButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
  },
  tipButtonDisabled: {
    backgroundColor: '#ccc',
  },
  tipButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
}); 