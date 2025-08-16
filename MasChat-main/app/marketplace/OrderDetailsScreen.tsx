import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import marketplaceService, { MarketplaceOrder } from '../lib/services/marketplaceService';
import { useAuth } from '../context/AuthContext';

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

const STATUS_COLORS = {
  pending: COLORS.warning,
  paid: COLORS.primary,
  shipped: COLORS.accent,
  completed: COLORS.success,
  cancelled: COLORS.error,
};

const STATUS_LABELS = {
  pending: 'Pending Payment',
  paid: 'Payment Received',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<MarketplaceOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const orderData = await marketplaceService.getOrderDetails(Number(orderId));
      setOrder(orderData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await marketplaceService.updateOrderStatus(Number(orderId), newStatus);
      setOrder(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Success', 'Order status updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    }
  };

  if (loading || !order) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  const isBuyer = user?.id === order.buyerId;
  const isSeller = user?.id === order.sellerId;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#2B6CD9']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id}</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <Text style={styles.statusTitle}>Order Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status as keyof typeof STATUS_COLORS] }]}>
                <Text style={styles.statusBadgeText}>{STATUS_LABELS[order.status as keyof typeof STATUS_LABELS]}</Text>
              </View>
            </View>
            <Text style={styles.orderDate}>Ordered on {new Date(order.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>

        {/* Order Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order ID</Text>
              <Text style={styles.detailValue}>#{order.id}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{order.quantity}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={styles.detailValue}>${order.totalAmount}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Payment Method</Text>
              <Text style={styles.detailValue}>{order.paymentMethod}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shipping Address</Text>
              <Text style={styles.detailValue}>{order.shippingAddress}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{order.phoneNumber}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {(isBuyer || isSeller) && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Actions</Text>
            <View style={styles.actionButtons}>
              {isBuyer && order.status === 'pending' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.success }]} onPress={() => handleUpdateStatus('paid')}>
                  <Ionicons name="card" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Mark as Paid</Text>
                </TouchableOpacity>
              )}
              
              {isSeller && order.status === 'paid' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.accent }]} onPress={() => handleUpdateStatus('shipped')}>
                  <Ionicons name="car" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Mark as Shipped</Text>
                </TouchableOpacity>
              )}
              
              {isBuyer && order.status === 'shipped' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.success }]} onPress={() => handleUpdateStatus('completed')}>
                  <Ionicons name="checkmark" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Mark as Received</Text>
                </TouchableOpacity>
              )}
              
              {(isBuyer || isSeller) && order.status === 'pending' && (
                <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.error }]} onPress={() => handleUpdateStatus('cancelled')}>
                  <Ionicons name="close" size={20} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Cancel Order</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Contact Information */}
        <View style={styles.contactSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactCard}>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
              <Text style={styles.contactButtonText}>Chat with {isBuyer ? 'Seller' : 'Buyer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Ionicons name="call" size={20} color={COLORS.primary} />
              <Text style={styles.contactButtonText}>Call {isBuyer ? 'Seller' : 'Buyer'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: COLORS.text },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.white },
  content: { flex: 1, padding: 16 },
  statusSection: { marginBottom: 24 },
  statusCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusBadgeText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  orderDate: { fontSize: 14, color: COLORS.lightText },
  detailsSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  detailsCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 16, color: COLORS.lightText },
  detailValue: { fontSize: 16, color: COLORS.text, fontWeight: '500' },
  actionsSection: { marginBottom: 24 },
  actionButtons: { gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 12 },
  actionButtonText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  contactSection: { marginBottom: 24 },
  contactCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, gap: 12 },
  contactButton: { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#f0f0f0', borderRadius: 8 },
  contactButtonText: { marginLeft: 8, fontSize: 16, color: COLORS.text },
}); 