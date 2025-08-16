import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import marketplaceService, { MarketplaceItem, MarketplaceCategory } from '../lib/services/marketplaceService';
import ModernHeader from '../../components/ModernHeader';
import { useTheme } from '../context/ThemeContext';

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

export default function MarketplaceScreen() {
  const router = useRouter();
  const { currentTheme } = useTheme();
  const colors = COLORS[currentTheme === 'dark' ? 'dark' : 'light'];
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setSelectedCategory(null);
    try {
      console.log('=== MARKETPLACE: Starting to fetch data ===');
      const [itemData, catData] = await Promise.all([
        marketplaceService.getItems(),
        marketplaceService.getCategories(),
      ]);
      console.log('=== MARKETPLACE: Successfully fetched data ===');
      console.log('Items:', itemData.length, 'Categories:', catData.length);
      setItems(itemData);
      setCategories(catData);
    } catch (error) {
      console.error('=== MARKETPLACE ERROR: Failed to fetch data ===');
      console.error('Error:', error);
      Alert.alert(
        'Error',
        'Failed to load marketplace items. Please check your connection and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: fetchData }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setSelectedCategory(null);
    const results = await marketplaceService.searchItems(search);
    setItems(results);
    setLoading(false);
  };

  const handleCategory = async (catId: number) => {
    setSelectedCategory(catId);
    setLoading(true);
    const results = await marketplaceService.getItemsByCategory(catId);
    setItems(results);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: MarketplaceItem }) => (
    <TouchableOpacity 
      style={[styles.itemCard, { backgroundColor: colors.card }]} 
      onPress={() => router.push({ pathname: '/marketplace/MarketplaceItemScreen', params: { itemId: item.id } })}
    >
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.itemImage} />
      <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[styles.itemPrice, { color: colors.accent }]}>${item.price}{item.negotiable ? ' (neg.)' : ''}</Text>
      <Text style={[styles.itemLocation, { color: colors.lightText }]}>{item.location}</Text>
      {/* Seller Information */}
      {item.seller && (
        <View style={styles.sellerInfo}>
          <Image 
            source={{ uri: item.seller.profilePicture || 'https://via.placeholder.com/30' }} 
            style={styles.sellerAvatar} 
          />
          <Text style={[styles.sellerName, { color: colors.text }]} numberOfLines={1}>
            {item.seller.fullName || item.seller.username}
          </Text>
        </View>
      )}
      <View style={styles.itemStatus}>
        <Text style={[styles.statusText, { color: item.status === 'active' ? '#4CAF50' : '#FF9800' }]}>
          {item.status === 'active' ? 'Available' : item.status}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <ModernHeader 
        title="Marketplace" 
        showAddButton={true}
        showProfileButton={true}
        showMassCoinBalance={true}
        onAdd={() => router.push('/marketplace/SellItemScreen')}
        onProfile={() => router.push('/(tabs)/profile')}
      />

      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.lightText} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search items, categories..."
          placeholderTextColor={colors.lightText}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
        <TouchableOpacity style={[styles.categoryChip, !selectedCategory && { backgroundColor: colors.primary }]} onPress={fetchData}>
          <Text style={[styles.categoryText, { color: colors.text }, !selectedCategory && { color: colors.card }]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryChip, selectedCategory === cat.id && { backgroundColor: colors.primary }]}
            onPress={() => handleCategory(cat.id)}
          >
            <Text style={[styles.categoryText, { color: colors.text }, selectedCategory === cat.id && { color: colors.card }]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Items Grid */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.itemsGrid}
          ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.lightText, marginTop: 32 }}>No items found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sellBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  sellBtnText: { fontWeight: 'bold', marginLeft: 6 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, margin: 16, paddingHorizontal: 12, height: 44, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 16 },
  categoriesRow: { flexGrow: 0, paddingHorizontal: 8, paddingBottom: 8 },
  categoryChip: { backgroundColor: '#e4e6eb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  categoryText: { fontWeight: '500' },
  itemsGrid: { paddingHorizontal: 8, paddingBottom: 80 },
  itemCard: { flex: 1, borderRadius: 12, margin: 8, padding: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  itemImage: { width: 120, height: 120, borderRadius: 8, marginBottom: 8, backgroundColor: '#eee' },
  itemTitle: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  itemPrice: { fontWeight: 'bold', fontSize: 15, marginBottom: 2 },
  itemLocation: { fontSize: 13 },
  sellerInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 4 },
  sellerAvatar: { width: 24, height: 24, borderRadius: 12, marginRight: 8 },
  sellerName: { fontWeight: 'bold', fontSize: 13 },
  itemStatus: { backgroundColor: '#f0f0f0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontWeight: 'bold', fontSize: 12 },
});