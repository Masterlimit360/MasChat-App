import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useWeb3 } from '../app/context/Web3Context';
import { massCoinService } from '../app/lib/services/massCoinService';

export default function BlockchainStatus() {
  const { isBlockchainEnabled, enableBlockchain } = useWeb3();
  const serviceBlockchainEnabled = massCoinService.isBlockchainEnabled();

  const handleEnableBlockchain = () => {
    enableBlockchain();
    massCoinService.enableBlockchain();
  };

  if (isBlockchainEnabled && serviceBlockchainEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, styles.enabled]} />
          <Text style={styles.statusText}>Blockchain Enabled</Text>
        </View>
        <Text style={styles.descriptionText}>
          MassCoin token is deployed and blockchain functionality is active
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, styles.disabled]} />
        <Text style={styles.statusText}>Blockchain Disabled</Text>
      </View>
      <Text style={styles.descriptionText}>
        MassCoin token is not yet deployed. Using mock data for development.
      </Text>
      <TouchableOpacity style={styles.enableButton} onPress={handleEnableBlockchain}>
        <Text style={styles.enableButtonText}>Enable Blockchain (After Deployment)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  enabled: {
    backgroundColor: '#4CAF50',
  },
  disabled: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  enableButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});
