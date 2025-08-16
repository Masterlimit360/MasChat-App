import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import marketplaceService, { MarketplaceItem, MarketplaceReview } from '../lib/services/marketplaceService';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../lib/services/messageService';

const COLORS = {
  primary: '#3A8EFF',
  accent: '#FF7F11',
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
  success: '#4CAF50',
};

export default function MarketplaceItemScreen() {
  const { itemId } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<MarketplaceItem | null>(null);
  const [reviews, setReviews] = useState<MarketplaceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [itemId]);

  const fetchData = async () => {
    setLoading(true);
    console.log('Fetching marketplace item with ID:', itemId);
    const [itemData, reviewData] = await Promise.all([
      marketplaceService.getItem(Number(itemId)),
      marketplaceService.getReviews(Number(itemId)),
    ]);
    console.log('Fetched item data:', itemData);
    console.log('Item seller:', itemData?.seller);
    setItem(itemData);
    setReviews(reviewData);
    setLoading(false);
  };

  const handleBuy = async () => {
    if (!user || !item) return;
    if (!item.seller) {
      Alert.alert('Error', 'Seller information not available. Please try again.');
      return;
    }
    setBuying(true);
    try {
      // Send message to seller with product info and image
      const productMessage = `Hi, I'm interested in your product: ${item.title} ($${item.price})`;
      const imageUrl = item.images && item.images.length > 0 ? item.images[0] : undefined;
      
      let messageSent = false;
      if (imageUrl) {
        try {
          await messageService.sendImageMessage(user.id, item.seller?.id, imageUrl, productMessage);
          messageSent = true;
        } catch (imageError) {
          console.error('Failed to send image message, trying text only:', imageError);
          // Fallback to text message if image fails
          await messageService.sendMessage(user.id, item.seller?.id, productMessage);
          messageSent = true;
        }
      } else {
        await messageService.sendMessage(user.id, item.seller?.id, productMessage);
        messageSent = true;
      }
      
      if (messageSent) {
        // Navigate to chat with seller
        const recipient = {
          id: item.seller?.id || '',
          username: item.seller?.username || '',
          name: item.seller?.fullName || item.seller?.username || 'Unknown Seller',
          image: item.seller?.profilePicture || '',
          profilePicture: item.seller?.profilePicture || '',
          fullName: item.seller?.fullName || '',
        };
        router.push({ pathname: '/screens/ChatScreen', params: { recipient: JSON.stringify(recipient) } });
      }
    } catch (e) {
      console.error('Buy function error:', e);
      Alert.alert('Error', 'Failed to contact seller. Please try again.');
    } finally {
      setBuying(false);
    }
  };

  const testImageColumn = async () => {
    try {
      const result = await messageService.testImageColumn();
      Alert.alert('Test Result', `Status: ${result.status}\nMessage: ${result.message}`);
    } catch (error: any) {
      Alert.alert('Test Failed', `Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (loading || !item) return <ActivityIndicator style={{ flex: 1, marginTop: 80 }} size="large" color={COLORS.primary} />;

  // Check if seller data is available
  if (!item.seller) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 }}>
        <Text style={{ color: COLORS.text, fontSize: 16 }}>Seller information not available</Text>
        <TouchableOpacity style={{ marginTop: 16, padding: 12, backgroundColor: COLORS.primary, borderRadius: 8 }} onPress={fetchData}>
          <Text style={{ color: COLORS.white }}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Images Carousel */}
      <FlatList
        data={item.images}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(uri, idx) => uri + idx}
        renderItem={({ item: img }) => (
          <Image source={{ uri: img }} style={styles.image} />
        )}
        style={styles.carousel}
      />
      {/* Title, Price, Seller */}
      <View style={styles.infoBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.price}>${item.price}{item.negotiable ? ' (neg.)' : ''}</Text>
        <Text style={styles.location}>{item.location}</Text>
        <Text style={styles.condition}>{item.condition}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity style={styles.sellerBox} onPress={() => router.push({ pathname: '/screens/FriendsProfileScreen', params: { userId: item.seller?.id } })}>
          <Image source={{ uri: item.seller?.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.sellerAvatar} />
          <Text style={styles.sellerName}>{item.seller?.fullName || item.seller?.username || 'Unknown Seller'}</Text>
        </TouchableOpacity>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {
            const recipient = {
              id: item.seller?.id || '',
              username: item.seller?.username || '',
              name: item.seller?.fullName || item.seller?.username || 'Unknown Seller',
              image: item.seller?.profilePicture || '',
              profilePicture: item.seller?.profilePicture || '',
              fullName: item.seller?.fullName || '',
            };
            router.push({ pathname: '/screens/ChatScreen', params: { recipient: JSON.stringify(recipient) } });
          }}>
            <Ionicons name="chatbubble-ellipses" size={22} color={COLORS.primary} />
            <Text style={styles.actionText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.success }]} onPress={() => router.push({ pathname: '/marketplace/BuyItemScreen', params: { itemId: item.id } })}>
            <Ionicons name="card" size={22} color={COLORS.white} />
            <Text style={[styles.actionText, { color: COLORS.white }]}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: COLORS.accent }]} onPress={handleBuy} disabled={buying}>
            <Ionicons name="cart" size={22} color={COLORS.white} />
            <Text style={[styles.actionText, { color: COLORS.white }]}>{buying ? 'Buying...' : 'Buy'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF6B6B' }]} onPress={testImageColumn}>
            <Ionicons name="bug" size={22} color={COLORS.white} />
            <Text style={[styles.actionText, { color: COLORS.white }]}>Test</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* Reviews */}
      <View style={styles.reviewsBox}>
        <Text style={styles.reviewsTitle}>Reviews</Text>
        {reviews.length === 0 ? (
          <Text style={styles.noReviews}>No reviews yet.</Text>
        ) : (
          reviews.map(r => (
            <View key={r.id} style={styles.reviewCard}>
              <Text style={styles.reviewUser}>{r.reviewer.fullName || r.reviewer.username}</Text>
              <Text style={styles.reviewRating}>{'★'.repeat(r.rating)}</Text>
              <Text style={styles.reviewComment}>{r.comment}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  carousel: { height: 220, backgroundColor: '#eee' },
  image: { width: 320, height: 220, borderRadius: 12, margin: 8 },
  infoBox: { padding: 16, backgroundColor: COLORS.white, borderRadius: 12, margin: 12, marginBottom: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, marginBottom: 4 },
  price: { color: COLORS.accent, fontWeight: 'bold', fontSize: 20, marginBottom: 2 },
  location: { color: COLORS.lightText, fontSize: 14, marginBottom: 2 },
  condition: { color: COLORS.primary, fontSize: 14, marginBottom: 2 },
  description: { color: COLORS.text, fontSize: 15, marginTop: 8, marginBottom: 8 },
  sellerBox: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  sellerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 8 },
  sellerName: { color: COLORS.primary, fontWeight: 'bold', fontSize: 15 },
  actionRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e4e6eb', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  actionText: { color: COLORS.text, fontWeight: 'bold', marginLeft: 6 },
  reviewsBox: { margin: 16, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  reviewsTitle: { fontWeight: 'bold', fontSize: 18, color: COLORS.text, marginBottom: 8 },
  noReviews: { color: COLORS.lightText, fontSize: 14 },
  reviewCard: { marginBottom: 12 },
  reviewUser: { fontWeight: 'bold', color: COLORS.primary },
  reviewRating: { color: '#fbbf24', fontSize: 16 },
  reviewComment: { color: COLORS.text, fontSize: 15 },
}); 