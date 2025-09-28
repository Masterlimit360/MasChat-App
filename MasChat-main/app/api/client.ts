// Supabase API Client for MasChat
// This replaces the Spring Boot backend with Supabase

import { supabase } from '../../lib/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

// API client for Supabase operations
export const apiClient = {
  // Authentication
  async signUp(email: string, password: string, username: string, fullName?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName
        }
      }
    })
    
    if (error) throw error
    
    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username,
          email,
          password_hash: '', // Supabase handles password hashing
          full_name: fullName,
          mass_coin_balance: 1000.00
        })
      
      if (profileError) throw profileError
    }
    
    return data
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  // Posts
  async getPosts() {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users:user_id (
          username,
          profile_image_url,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async createPost(content: string, imageUrl?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl
      })
      .select(`
        *,
        users:user_id (
          username,
          profile_image_url,
          full_name
        )
      `)
    
    if (error) throw error
    return data[0]
  },

  async likePost(postId: string) {
    const { data, error } = await supabase.rpc('increment_likes', {
      post_id: postId
    })
    
    if (error) throw error
    return data
  },

  // Comments
  async getComments(postId: string) {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        users:user_id (
          username,
          profile_image_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data
  },

  async createComment(postId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        users:user_id (
          username,
          profile_image_url
        )
      `)
    
    if (error) throw error
    return data[0]
  },

  // Friends
  async getFriends() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('friends')
      .select(`
        *,
        friend:friend_id (
          id,
          username,
          profile_image_url,
          full_name
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'accepted')
    
    if (error) throw error
    return data
  },

  async sendFriendRequest(friendId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('friends')
      .insert({
        user_id: user.id,
        friend_id: friendId,
        status: 'pending'
      })
    
    if (error) throw error
    return data
  },

  // MassCoin
  async getMassCoinBalance() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('users')
      .select('mass_coin_balance')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data.mass_coin_balance
  },

  async transferMassCoin(toUserId: string, amount: number, description?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    // Start transaction
    const { data, error } = await supabase.rpc('transfer_mass_coin', {
      from_user_id: user.id,
      to_user_id: toUserId,
      amount,
      description
    })
    
    if (error) throw error
    return data
  },

  async getMassCoinTransactions() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')
    
    const { data, error } = await supabase
      .from('mass_coin_transactions')
      .select(`
        *,
        from_user:from_user_id (
          username
        ),
        to_user:to_user_id (
          username
        )
      `)
      .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  // Real-time subscriptions
  subscribeToPosts(callback: (payload: any) => void) {
    return supabase
      .channel('posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        callback
      )
      .subscribe()
  },

  subscribeToComments(postId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` },
        callback
      )
      .subscribe()
  }
}

// Legacy compatibility - keep these for existing code
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    return !error
  } catch (error) {
    console.error("Supabase connection test failed:", error)
    return false
  }
}

export const getUploadUrl = (fileName: string): string => {
  // Supabase storage URL for file uploads
  return `https://htgchjzullqxkegmtiff.supabase.co/storage/v1/object/public/uploads/${fileName}`
}

export const getWebSocketUrl = (): string => {
  // Supabase handles real-time via subscriptions, not WebSockets
  return 'supabase-realtime'
}

// Export the main client
export default apiClient
