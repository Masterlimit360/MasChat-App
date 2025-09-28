import { supabase } from '../../../lib/supabase';

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
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  item?: MarketplaceItem;
}

export interface MarketplaceBusinessAccount {
  id: number;
  userId: string;
  businessName: string;
  businessType: string;
  description: string;
  logo: string;
  contactInfo: string;
}

export const marketplaceService = {
  // Get all items
  async getItems(): Promise<MarketplaceItem[]> {
    try {
      console.log('=== FRONTEND: Fetching marketplace items from Supabase ===');
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('=== FRONTEND: Received response:', data?.length || 0, 'items');

      if (data && Array.isArray(data)) {
        data.forEach((item, index) => {
          console.log(`Item ${index}:`, {
            id: item.id,
            title: item.title,
            seller: item.seller ? `${item.seller.username} (ID: ${item.seller.id})` : 'NULL'
          });
        });
      }

      return data || [];
    } catch (error: any) {
      console.error('=== FRONTEND ERROR: Failed to fetch marketplace items ===');
      console.error('Error details:', error);
      
      // Show user-friendly error
      throw new Error('Failed to load marketplace items. Please try again.');
    }
  },

  // Get item by ID
  async getItem(id: number): Promise<MarketplaceItem> {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  },

  // Get categories
  async getCategories(): Promise<MarketplaceCategory[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create item
  async createItem(item: Omit<MarketplaceItem, 'id' | 'seller'>): Promise<MarketplaceItem> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
          title: item.title,
          description: item.description,
          price: item.price,
          negotiable: item.negotiable,
          category_id: item.category.id,
          condition: item.condition,
          images: item.images,
          delivery_method: item.deliveryMethod,
          location: item.location,
          status: item.status,
          user_id: user.id
        })
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  },

  // Update item
  async updateItem(id: number, updates: Partial<MarketplaceItem>): Promise<MarketplaceItem> {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          negotiable: updates.negotiable,
          condition: updates.condition,
          images: updates.images,
          delivery_method: updates.deliveryMethod,
          location: updates.location,
          status: updates.status
        })
        .eq('id', id)
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  // Delete item
  async deleteItem(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },

  // Get user's items
  async getUserItems(userId: string): Promise<MarketplaceItem[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user items:', error);
      throw error;
    }
  },

  // Search items
  async searchItems(query: string, categoryId?: number): Promise<MarketplaceItem[]> {
    try {
      let queryBuilder = supabase
        .from('marketplace_items')
        .select(`
          *,
          seller:user_id (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      if (categoryId) {
        queryBuilder = queryBuilder.eq('category_id', categoryId);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching items:', error);
      throw error;
    }
  },

  // Create order
  async createOrder(order: Omit<MarketplaceOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<MarketplaceOrder> {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .insert({
          item_id: order.itemId,
          buyer_id: order.buyerId,
          seller_id: order.sellerId,
          quantity: order.quantity,
          total_price: order.totalPrice,
          status: order.status
        })
        .select(`
          *,
          item:item_id (
            *,
            seller:user_id (
              id,
              username,
              full_name,
              profile_image_url
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Get user orders
  async getUserOrders(userId: string): Promise<MarketplaceOrder[]> {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .select(`
          *,
          item:item_id (
            *,
            seller:user_id (
              id,
              username,
              full_name,
              profile_image_url
            )
          )
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  },

  // Update order status
  async updateOrderStatus(orderId: number, status: string): Promise<MarketplaceOrder> {
    try {
      const { data, error } = await supabase
        .from('marketplace_orders')
        .update({ status })
        .eq('id', orderId)
        .select(`
          *,
          item:item_id (
            *,
            seller:user_id (
              id,
              username,
              full_name,
              profile_image_url
            )
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Business account operations
  async createBusinessAccount(account: Omit<MarketplaceBusinessAccount, 'id'>): Promise<MarketplaceBusinessAccount> {
    try {
      const { data, error } = await supabase
        .from('marketplace_business_accounts')
        .insert({
          user_id: account.userId,
          business_name: account.businessName,
          business_type: account.businessType,
          description: account.description,
          logo: account.logo,
          contact_info: account.contactInfo
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating business account:', error);
      throw error;
    }
  },

  async getBusinessAccount(userId: string): Promise<MarketplaceBusinessAccount | null> {
    try {
      const { data, error } = await supabase
        .from('marketplace_business_accounts')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching business account:', error);
      throw error;
    }
  },

  async updateBusinessAccount(userId: string, updates: Partial<MarketplaceBusinessAccount>): Promise<MarketplaceBusinessAccount> {
    try {
      const { data, error } = await supabase
        .from('marketplace_business_accounts')
        .update({
          business_name: updates.businessName,
          business_type: updates.businessType,
          description: updates.description,
          logo: updates.logo,
          contact_info: updates.contactInfo
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating business account:', error);
      throw error;
    }
  },
};