import { createClient } from '@supabase/supabase-js'

// Use hardcoded values for now to ensure deployment works
const supabaseUrl = 'https://htgchjzullqxkegmtiff.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0Z2Noanp1bGxxeGtlZ210aWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTczMTAsImV4cCI6MjA3NDU5MzMxMH0.fKs39s2lnsBM7PfA8fUsUbxqDLQXIPvz6q5nXCtdVTg'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Database types (you can generate these with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          password_hash: string
          full_name: string | null
          bio: string | null
          profile_image_url: string | null
          mass_coin_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email: string
          password_hash: string
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          mass_coin_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string
          password_hash?: string
          full_name?: string | null
          bio?: string | null
          profile_image_url?: string | null
          mass_coin_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      friends: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: string
          created_at?: string
        }
      }
      mass_coin_transactions: {
        Row: {
          id: string
          from_user_id: string | null
          to_user_id: string | null
          amount: number
          transaction_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          amount: number
          transaction_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string | null
          to_user_id?: string | null
          amount?: number
          transaction_type?: string
          description?: string | null
          created_at?: string
        }
      }
    }
  }
}
