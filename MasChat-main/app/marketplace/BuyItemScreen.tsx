import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import marketplaceService, { MarketplaceItem } from '../lib/services/marketplaceService';
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
};

export default function BuyItemScreen() {
  const { itemId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  
  // Form fields
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    fetchItem();
  }, [itemId]);

  const fetchItem = async () => {
    try {
      const itemData = await marketplaceService.getItem(Number(itemId));
      setItem(itemData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load item details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!item) return 0;
    const basePrice = item.price;
    const shippingCost = item.deliveryMethod === 'Shipping' ? 10 : 0;
    return (basePrice + shippingCost) * parseInt(quantity || '1');
  };

  const handleBuyNow = async () => {
    if (!user || !item) return;

    // Validation
    if (!shippingAddress.trim()) {
      Alert.alert('Error', 'Please enter your shipping address');
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setBuying(true);
    try {
      // Create order
      const orderData = {
        itemId: item.id,
        buyerId: user.id,
        sellerId: item.seller?.id,
        quantity: parseInt(quantity),
        totalAmount: calculateTotal(),
        shippingAddress,
        phoneNumber,
        paymentMethod,
        status: 'pending'
      };

      const order = await marketplaceService.createOrder(orderData);
      
      // Update item status
      await marketplaceService.updateItemStatus(item.id, 'sold');
      
      // Send notification to seller
      await marketplaceService.notifySeller(item.seller?.id, order.id);
      
      Alert.alert(
        'Order Placed Successfully!',
        `Your order #${order.id} has been placed. The seller will contact you soon.`,
        [
          {
            text: 'View Order',
            onPress: () => router.push({ pathname: '/marketplace/OrderDetailsScreen', params: { orderId: order.id } })
          },
          {
            text: 'Continue Shopping',
            onPress: () => router.push('/(tabs)/marketplace')
          }
        ]
      );
    } catch (error) {
      console.error('Buy error:', error);
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  if (loading || !item) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading item details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[COLORS.primary, '#2B6CD9']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Buy Item</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Item Details */}
        <View style={styles.itemSection}>
          <Text style={styles.sectionTitle}>Item Details</Text>
          <View style={styles.itemCard}>
            <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <Text style={styles.itemDescription}>{item.description}</Text>
              <Text style={styles.itemCondition}>Condition: {item.condition}</Text>
            </View>
          </View>
        </View>

        {/* Seller Information */}
        {item.seller && (
          <View style={styles.sellerSection}>
            <Text style={styles.sectionTitle}>Seller Information</Text>
            <View style={styles.sellerCard}>
              <Image source={{ uri: item.seller.profilePicture || 'https://via.placeholder.com/50' }} style={styles.sellerAvatar} />
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{item.seller.fullName || item.seller.username}</Text>
                <Text style={styles.sellerLocation}>{item.location}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Ionicons name="chatbubble" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order Details */}
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Order Details</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Quantity</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="1"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Shipping Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={shippingAddress}
              onChangeText={setShippingAddress}
              placeholder="Enter your full shipping address"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Payment Method</Text>
            <View style={styles.paymentOptions}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'cash' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('cash')}
              >
                <Ionicons name="cash" size={20} color={paymentMethod === 'cash' ? COLORS.white : COLORS.text} />
                <Text style={[styles.paymentText, paymentMethod === 'cash' && styles.paymentTextActive]}>Cash</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'card' && styles.paymentOptionActive]}
                onPress={() => setPaymentMethod('card')}
              >
                <Ionicons name="card" size={20} color={paymentMethod === 'card' ? COLORS.white : COLORS.text} />
                <Text style={[styles.paymentText, paymentMethod === 'card' && styles.paymentTextActive]}>Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceSection}>
          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.priceCard}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Item Price</Text>
              <Text style={styles.priceValue}>${item.price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Shipping</Text>
              <Text style={styles.priceValue}>${item.deliveryMethod === 'Shipping' ? 10 : 0}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Quantity</Text>
              <Text style={styles.priceValue}>x{quantity}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${calculateTotal()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Buy Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.buyButton, buying && styles.buyButtonDisabled]}
          onPress={handleBuyNow}
          disabled={buying}
        >
          {buying ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Ionicons name="cart" size={20} color={COLORS.white} />
              <Text style={styles.buyButtonText}>Buy Now - ${calculateTotal()}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  itemSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 12 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, flexDirection: 'row' },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  itemInfo: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  itemPrice: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent, marginBottom: 4 },
  itemDescription: { fontSize: 14, color: COLORS.lightText, marginBottom: 4 },
  itemCondition: { fontSize: 14, color: COLORS.primary },
  sellerSection: { marginBottom: 24 },
  sellerCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  sellerLocation: { fontSize: 14, color: COLORS.lightText },
  contactButton: { padding: 8 },
  orderSection: { marginBottom: 24 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  input: { backgroundColor: COLORS.white, borderRadius: 8, padding: 12, fontSize: 16, borderWidth: 1, borderColor: '#e0e0e0' },
  textArea: { height: 80, textAlignVertical: 'top' },
  paymentOptions: { flexDirection: 'row', gap: 12 },
  paymentOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.white, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#e0e0e0' },
  paymentOptionActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  paymentText: { marginLeft: 8, fontSize: 16, color: COLORS.text },
  paymentTextActive: { color: COLORS.white },
  priceSection: { marginBottom: 24 },
  priceCard: { backgroundColor: COLORS.white, borderRadius: 12, padding: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 16, color: COLORS.text },
  priceValue: { fontSize: 16, color: COLORS.text },
  totalRow: { borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 8, marginTop: 8 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  buyButton: { backgroundColor: COLORS.accent, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  buyButtonDisabled: { opacity: 0.7 },
  buyButtonText: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
}); 