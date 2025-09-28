import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type UserDetails = {
  profileType?: string;
  worksAt1?: string;
  worksAt2?: string;
  studiedAt?: string;
  wentTo?: string;
  currentCity?: string;
  hometown?: string;
  relationshipStatus?: string;
  showAvatar?: boolean;
  avatarSwipeEnabled?: boolean;
  avatar?: string;
  followerCount?: number;
  followingCount?: number;
};

type User = {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  avatar?: string;
  details?: UserDetails;
  createdAt?: string;
  updatedAt?: string;
  verified?: boolean;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (updatedUser?: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        // Check if user is already signed in with Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session?.user && !error) {
          console.log('User already signed in with Supabase:', session.user.email);
          
          // Get user profile from our users table
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          if (userProfile && !profileError) {
            const userData = {
              id: userProfile.id,
              username: userProfile.username,
              email: userProfile.email,
              fullName: userProfile.full_name,
              profilePicture: userProfile.profile_image_url,
              bio: userProfile.bio,
              createdAt: userProfile.created_at,
              updatedAt: userProfile.updated_at,
            };
            
            setUser(userData);
            setToken(session.access_token);
            
            // Store in AsyncStorage for persistence
            await Promise.all([
              AsyncStorage.setItem('userToken', session.access_token),
              AsyncStorage.setItem('user', JSON.stringify(userData)),
            ]);
            
            router.replace('/(tabs)/home');
          } else if (profileError) {
            console.log('User profile not found, redirecting to signup');
            // Don't sign out, just redirect to signup to complete profile
            router.replace('/(auth)/signup');
          } else {
            // User exists in auth but not in our users table
            // This can happen if signup profile creation failed
            console.log('User authenticated but profile not found, redirecting to signup');
            router.replace('/(auth)/signup');
          }
        } else {
          console.log('No active session, checking stored credentials...');
          
          // Check for stored credentials as fallback
          const [storedToken, storedUser] = await Promise.all([
            AsyncStorage.getItem('userToken'),
            AsyncStorage.getItem('user'),
          ]);
          
          if (storedToken && storedUser) {
            console.log('Found stored credentials, validating...');
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            router.replace('/(tabs)/home');
          }
        }
      } catch (error) {
        console.error('Failed to load authentication data:', error);
        // Clear any corrupted data
        await Promise.all([
          AsyncStorage.removeItem('userToken'),
          AsyncStorage.removeItem('user'),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  // Supabase sign in method
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error('Profile error:', profileError);
          // If profile doesn't exist, redirect to signup
          router.replace('/(auth)/signup');
          return;
        }
        
        if (!userProfile) {
          console.log('User profile not found, redirecting to signup');
          router.replace('/(auth)/signup');
          return;
        }
        
        const userData = {
          id: userProfile.id,
          username: userProfile.username,
          email: userProfile.email,
          fullName: userProfile.full_name,
          profilePicture: userProfile.profile_image_url,
          bio: userProfile.bio,
          createdAt: userProfile.created_at,
          updatedAt: userProfile.updated_at,
        };
        
        await Promise.all([
          AsyncStorage.setItem('userToken', data.session.access_token),
          AsyncStorage.setItem('user', JSON.stringify(userData)),
        ]);
        
        setToken(data.session.access_token);
        setUser(userData);
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('user'),
      ]);
      
      setToken(null);
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  // Accepts a partial user update, merges with current user, and updates storage/context
  const updateUser = async (updatedUser?: Partial<User>) => {
    try {
      if (!user) return;
      
      // Update user in Supabase
      const { error } = await supabase
        .from('users')
        .update({
          username: updatedUser?.username || user.username,
          full_name: updatedUser?.fullName || user.fullName,
          profile_image_url: updatedUser?.profilePicture || user.profilePicture,
          bio: updatedUser?.bio || user.bio,
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update local state
      const mergedUser = { ...user, ...updatedUser };
      await AsyncStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  // Always fetches the latest user from Supabase and updates context/storage
  const refreshUser = async () => {
    try {
      if (!user?.id) return;
      
      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }
      
      const userData = {
        id: userProfile.id,
        username: userProfile.username,
        email: userProfile.email,
        fullName: userProfile.full_name,
        profilePicture: userProfile.profile_image_url,
        bio: userProfile.bio,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signIn,
        signOut,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
