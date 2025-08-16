import client from '../../api/client';

export type MarketplaceCategory = {
  id: number;
  name: string;
  icon?: string;
};

export interface MarketplaceItem {
  id: number;
  title: string;
  description: string;
  price: number;
  negotiable: boolean;
  category: MarketplaceCategory;
  condition: string;
  images: string[];
  deliveryMethod: string;
  location: string;
  status: string;
  seller?: {
    id: string;
    username: string;
    fullName?: string;
    profilePicture?: string;
  };
}

export interface MarketplaceOrder {
  id: number;
  itemId: number;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalAmount: number;
  shippingAddress: string;
  phoneNumber: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  price?: number;
  deliveryMethod?: string;
  fee?: number;
  updatedAt?: string;
}

export type MarketplaceReview = {
  id: number;
  item: MarketplaceItem;
  reviewer: any;
  rating: number;
  comment: string;
  createdAt: string;
};

export type MarketplaceBusinessAccount = {
  id: number;
  user: any;
  businessName: string;
  description: string;
  logo: string;
  contactInfo: string;
};

export const marketplaceService = {
  // Get all items
  async getItems(): Promise<MarketplaceItem[]> {
    try {
      console.log('=== FRONTEND: Fetching marketplace items ===');
      const response = await client.get('/marketplace/items');
      console.log('=== FRONTEND: Received response:', response.status, response.data?.length || 0, 'items');

      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            id: item.id,
            title: item.title,
            seller: item.seller ? `${item.seller.username} (ID: ${item.seller.id})` : 'NULL'
          });
        });
      }

      return response.data;
    } catch (error: any) {
      console.error('=== FRONTEND ERROR: Failed to fetch marketplace items ===');
      console.error('Error details:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      
      // Show user-friendly error
      throw new Error('Failed to load marketplace items. Please try again.');
    }
  },

  // Get item by ID
  async getItem(id: number): Promise<MarketplaceItem> {
    try {
      const response = await client.get(`/marketplace/items/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  // Get categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    try {
      const response = await client.get('/marketplace/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Search items
  async searchItems(query: string): Promise<MarketplaceItem[]> {
    try {
      const response = await client.get(`/marketplace/items/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching items:', error);
      return [];
    }
  },

  // Get items by category
  async getItemsByCategory(categoryId: number): Promise<MarketplaceItem[]> {
    try {
      const response = await client.get(`/marketplace/items/category/${categoryId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching items by category:', error);
      return [];
    }
  },

  // Create new marketplace item
  async createItem(itemData: {
    title: string;
    description: string;
    price: number;
    negotiable: boolean;
    condition: string;
    deliveryMethod: string;
    location: string;
    images: string[];
    sellerId: string;
    categoryId?: number;
    status?: string;
  }): Promise<MarketplaceItem> {
    try {
      const response = await client.post('/marketplace/items/create-with-seller', itemData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating marketplace item:', error);
      throw new Error('Failed to create marketplace item. Please try again.');
    }
  },

  // Create order
  async createOrder(orderData: {
    itemId: number;
    buyerId: string;
    sellerId: string;
    quantity: number;
    totalAmount: number;
    shippingAddress: string;
    phoneNumber: string;
    paymentMethod: string;
    status: string;
  }): Promise<MarketplaceOrder> {
    try {
      const response = await client.post('/marketplace/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update item status
  async updateItemStatus(itemId: number, status: string): Promise<void> {
    try {
      await client.patch(`/marketplace/items/${itemId}/status`, { status });
    } catch (error) {
      console.error('Error updating item status:', error);
      throw error;
    }
  },

  // Notify seller
  async notifySeller(sellerId: string, orderId: number): Promise<void> {
    try {
      await client.post('/marketplace/notifications/seller', {
        sellerId,
        orderId,
        type: 'new_order'
      });
    } catch (error) {
      console.error('Error notifying seller:', error);
      // Don't throw error as this is not critical
    }
  },

  // Get user orders
  async getUserOrders(userId: string): Promise<MarketplaceOrder[]> {
    try {
      const response = await client.get(`/marketplace/orders/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  // Get order details
  async getOrderDetails(orderId: number): Promise<MarketplaceOrder> {
    try {
      const response = await client.get(`/marketplace/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, status: string): Promise<void> {
    try {
      await client.patch(`/marketplace/orders/${orderId}/status`, { status });
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  async getReviews(itemId: number) {
    const res = await client.get(`/marketplace/reviews/item/${itemId}`);
    return res.data;
  },
  async createReview(review: Partial<MarketplaceReview>) {
    const res = await client.post('/marketplace/reviews', review);
    return res.data;
  },
  async getBusinessAccount(userId: number) {
    const res = await client.get(`/marketplace/business-accounts/user/${userId}`);
    return res.data;
  },
  async createBusinessAccount(account: Partial<MarketplaceBusinessAccount>) {
    const res = await client.post('/marketplace/business-accounts', account);
    return res.data;
  },
};

export default marketplaceService; 