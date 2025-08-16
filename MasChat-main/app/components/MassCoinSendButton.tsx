import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  View,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import MassCoinTransferModal from './MassCoinTransferModal';

interface MassCoinSendButtonProps {
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
  contextType: 'POST' | 'REEL' | 'CHAT' | 'DIRECT' | 'MASS_COIN_SECTION';
  contextId?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button' | 'text';
  onSuccess?: () => void;
  disabled?: boolean;
}

const MassCoinSendButton: React.FC<MassCoinSendButtonProps> = ({
  recipientId,
  recipientName,
  recipientAvatar,
  contextType,
  contextId,
  size = 'medium',
  variant = 'icon',
  onSuccess,
  disabled = false
}) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);

  const colors = {
    light: {
      primary: '#4361EE',
      text: '#212529',
      textSecondary: '#6C757D',
      background: '#FFFFFF',
      border: '#E9ECEF'
    },
    dark: {
      primary: '#4361EE',
      text: '#FFFFFF',
      textSecondary: '#B0B0B0',
      background: '#1A1A2E',
      border: '#404040'
    }
  };

  const currentColors = colors[currentTheme === 'dark' ? 'dark' : 'light'];

  const handlePress = () => {
    if (disabled) return;
    
    if (!user?.id) {
      Alert.alert('Login Required', 'You must be logged in to send Mass Coins');
      return;
    }

    if (user.id === recipientId) {
      Alert.alert('Invalid Action', 'You cannot send Mass Coins to yourself');
      return;
    }

    setModalVisible(true);
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: { padding: 6 },
          icon: 16,
          text: 12
        };
      case 'large':
        return {
          container: { padding: 12 },
          icon: 24,
          text: 16
        };
      default: // medium
        return {
          container: { padding: 8 },
          icon: 20,
          text: 14
        };
    }
  };

  const sizeStyles = getSizeStyles();

  const renderContent = () => {
    switch (variant) {
      case 'button':
        return (
          <View style={[styles.buttonContent, sizeStyles.container]}>
            <Ionicons 
              name="wallet" 
              size={sizeStyles.icon} 
              color={currentColors.primary} 
            />
            <Text style={[
              styles.buttonText, 
              { 
                color: currentColors.primary, 
                fontSize: sizeStyles.text 
              }
            ]}>
              Send Mass Coins
            </Text>
          </View>
        );
      
      case 'text':
        return (
          <Text style={[
            styles.textButton, 
            { 
              color: currentColors.primary, 
              fontSize: sizeStyles.text 
            }
          ]}>
            💰 Send Mass Coins
          </Text>
        );
      
      default: // icon
        return (
          <View style={[styles.iconContainer, sizeStyles.container]}>
            <Ionicons 
              name="wallet" 
              size={sizeStyles.icon} 
              color={currentColors.primary} 
            />
          </View>
        );
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.container,
          {
            opacity: disabled ? 0.5 : 1
          }
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {renderContent()}
      </TouchableOpacity>

      <MassCoinTransferModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        recipientId={recipientId}
        recipientName={recipientName}
        recipientAvatar={recipientAvatar}
        contextType={contextType}
        contextId={contextId}
        onSuccess={onSuccess}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconContainer: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(67, 97, 238, 0.3)',
    backgroundColor: 'rgba(67, 97, 238, 0.1)'
  },
  buttonText: {
    fontWeight: '600'
  },
  textButton: {
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});

export default MassCoinSendButton; 