import { Ionicons } from "@expo/vector-icons";
import ModernHeader from '../components/ModernHeader';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import SuggestionCard from './SuggestionCard';
import { useAuth } from '../context/AuthContext';
import { friendService } from '../lib/services/friendService';
import { useFocusEffect } from '@react-navigation/native';

// Color Palette (matching home screen)
const COLORS = {
  primary: '#3A8EFF',  // Deep Blue
  accent: '#FF7F11',   // Vibrant Orange
  background: '#F5F7FA',
  white: '#FFFFFF',
  text: '#333333',
  lightText: '#888888',
};

type Suggestion = {
  id: string;
  username: string;
  fullName?: string;
  profilePicture?: string;
};

export default function SuggestionsScreen() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const fetchSuggestions = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching suggestions for user:', user.id);
      const data = await friendService.getSuggestions(user.id);
      console.log('Suggestions data received:', data);
      setSuggestions(data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setError('Failed to load suggestions. Please try again.');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [user?.id]);

  useFocusEffect(
    React.useCallback(() => {
      fetchSuggestions();
    }, [user?.id])
  );

  const handleRetry = () => {
    fetchSuggestions();
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading suggestions...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={COLORS.accent} />
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (suggestions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={COLORS.lightText} />
          <Text style={styles.emptyText}>No suggestions available</Text>
          <Text style={styles.emptySubtext}>We'll show you people you may know based on your connections</Text>
        </View>
      );
    }

    return suggestions.map(sug => (
      <SuggestionCard key={sug.id} suggestion={sug} />
    ));
  };

  return (
    <View style={styles.container}>
      <ModernHeader 
        title="Friend Suggestions" 
        showBackButton={true}
        onBackPress={() => router.back()}
      />
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.lightText,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.lightText,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
