import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList, Image, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { massCoinService, UserSearchResult } from '../lib/services/massCoinService';
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

export default function MassCoinSendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const quickAmounts = [10, 25, 50, 100, 250, 500];

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    if (!user?.id || searchQuery.trim().length < 2) return;
    
    setIsSearching(true);
    try {
      const results = await massCoinService.searchUsers(searchQuery, Number(user.id));
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: UserSearchResult) => {
    setSelectedUser(user);
    setSearchQuery(user.username);
    setSearchResults([]);
  };

  const handleSend = async () => {
    if (!user?.id || !selectedUser) {
      Alert.alert('Error', 'Please select a recipient.');
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
        recipientId: selectedUser.id,
        amount: numAmount,
        message: message.trim() || undefined,
        contextType: 'MASS_COIN_SECTION' as const,
        transactionType: 'P2P_TRANSFER' as const,
      };

      await massCoinService.transferMass(Number(user.id), transferRequest);
      
      Alert.alert(
        'Success!',
        `Successfully sent ${massCoinService.formatAmount(numAmount)} MASS to ${selectedUser.fullName || selectedUser.username}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Error sending tokens:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send tokens. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: UserSearchResult }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.card }]}
      onPress={() => handleUserSelect(item)}
    >
      <Image
        source={{ uri: item.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }}
        style={styles.userAvatar}
      />
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: colors.text }]}>
          {item.fullName || item.username}
        </Text>
        <Text style={[styles.userUsername, { color: colors.lightText }]}>
          @{item.username}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.lightText} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Send MASS Tokens</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Search Section */}
        <View style={[styles.searchSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recipient</Text>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={colors.lightText} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by ID, username, or full name..."
              placeholderTextColor={colors.lightText}
            />
            {isSearching && <ActivityIndicator size="small" color={colors.primary} style={styles.searchLoading} />}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Selected User */}
          {selectedUser && (
            <View style={[styles.selectedUser, { backgroundColor: colors.background }]}>
              <Image
                source={{ uri: selectedUser.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={styles.selectedUserAvatar}
              />
              <View style={styles.selectedUserInfo}>
                <Text style={[styles.selectedUserName, { color: colors.text }]}>
                  {selectedUser.fullName || selectedUser.username}
                </Text>
                <Text style={[styles.selectedUserUsername, { color: colors.lightText }]}>
                  @{selectedUser.username}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedUser(null)}>
                <Ionicons name="close-circle" size={24} color={colors.lightText} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Amount Section */}
        <View style={[styles.amountSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Amount</Text>
          
          <View style={styles.amountInputContainer}>
            <MassCoinIcon size={24} style={styles.amountIcon} />
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              autoFocus={false}
            />
            <Text style={[styles.amountLabel, { color: colors.text }]}>MASS</Text>
          </View>

          {/* Quick Amounts */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={[styles.quickAmountButton, { backgroundColor: colors.background }]}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={[styles.quickAmountText, { color: colors.primary }]}>{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Message Section */}
        <View style={[styles.messageSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Message (Optional)</Text>
          <TextInput
            style={[styles.messageInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Add a message..."
            multiline
            numberOfLines={3}
            placeholderTextColor={colors.lightText}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: selectedUser && amount ? colors.primary : colors.lightText },
            !selectedUser || !amount ? styles.sendButtonDisabled : null
          ]}
          onPress={handleSend}
          disabled={!selectedUser || !amount || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <MassCoinIcon size={20} />
              <Text style={styles.sendButtonText}>Send Tokens</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  searchSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  searchIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    paddingLeft: 40,
    fontSize: 16,
  },
  searchLoading: {
    position: 'absolute',
    right: 12,
  },
  searchResults: {
    marginTop: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  userUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  selectedUser: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  selectedUserAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  selectedUserInfo: {
    flex: 1,
  },
  selectedUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedUserUsername: {
    fontSize: 14,
    marginTop: 2,
  },
  amountSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  amountIcon: {
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
  },
  amountLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD700',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '30%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageSection: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
}); 