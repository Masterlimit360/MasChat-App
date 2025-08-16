import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  useColorScheme,
  Image,
  FlatList
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import ModernHeader from '../../components/ModernHeader';

const { width } = Dimensions.get('window');

// Color Palette
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
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
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
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },
};

interface SupportTopic {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: boolean;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  category: string;
}

export default function SupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = COLORS[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const [supportTopics, setSupportTopics] = useState<SupportTopic[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'help' | 'faq' | 'tickets' | 'contact'>('help');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for development
      const mockSupportTopics: SupportTopic[] = [
        {
          id: '1',
          title: 'Account & Security',
          description: 'Help with account settings, passwords, and security',
          icon: 'shield-checkmark',
          color: colors.primary,
          category: 'Account'
        },
        {
          id: '2',
          title: 'Mass Coin & Payments',
          description: 'Questions about Mass Coin, transactions, and payments',
          icon: 'card',
          color: colors.gold,
          category: 'Payments'
        },
        {
          id: '3',
          title: 'Posts & Content',
          description: 'Help with creating, editing, and managing content',
          icon: 'create',
          color: colors.accent,
          category: 'Content'
        },
        {
          id: '4',
          title: 'Friends & Groups',
          description: 'Managing friends, groups, and connections',
          icon: 'people',
          color: colors.success,
          category: 'Social'
        },
        {
          id: '5',
          title: 'Marketplace',
          description: 'Buying, selling, and marketplace features',
          icon: 'storefront',
          color: colors.secondary,
          category: 'Marketplace'
        },
        {
          id: '6',
          title: 'Technical Issues',
          description: 'App crashes, bugs, and technical problems',
          icon: 'bug',
          color: colors.bronze,
          category: 'Technical'
        }
      ];

      const mockFaqs: FAQ[] = [
        {
          id: '1',
          question: 'How do I reset my password?',
          answer: 'Go to Settings > Security > Change Password. You can also use the "Forgot Password" option on the login screen.',
          category: 'Account',
          helpful: true
        },
        {
          id: '2',
          question: 'How do I earn Mass Coins?',
          answer: 'You can earn Mass Coins by creating engaging content, receiving tips from other users, participating in challenges, and completing daily tasks.',
          category: 'Payments',
          helpful: true
        },
        {
          id: '3',
          question: 'How do I create a group?',
          answer: 'Go to Menu > Groups > Create Group. Fill in the group details and invite your friends to join.',
          category: 'Social',
          helpful: false
        },
        {
          id: '4',
          question: 'How do I report inappropriate content?',
          answer: 'Tap the three dots on any post and select "Report". Choose the reason and submit your report.',
          category: 'Content',
          helpful: true
        },
        {
          id: '5',
          question: 'How do I sell items on the marketplace?',
          answer: 'Go to Marketplace > Sell Item. Upload photos, add description, set price, and publish your listing.',
          category: 'Marketplace',
          helpful: false
        }
      ];

      const mockTickets: SupportTicket[] = [
        {
          id: '1',
          title: 'Cannot login to my account',
          description: 'I\'m getting an error message when trying to login with my email and password.',
          status: 'open',
          priority: 'high',
          createdAt: '2024-01-15',
          updatedAt: '2024-01-15',
          category: 'Account'
        },
        {
          id: '2',
          title: 'Mass Coin transaction failed',
          description: 'I tried to send 50 MASS to a friend but the transaction failed and my coins were deducted.',
          status: 'in-progress',
          priority: 'urgent',
          createdAt: '2024-01-14',
          updatedAt: '2024-01-15',
          category: 'Payments'
        },
        {
          id: '3',
          title: 'App crashes when posting',
          description: 'The app crashes every time I try to create a new post with images.',
          status: 'resolved',
          priority: 'medium',
          createdAt: '2024-01-13',
          updatedAt: '2024-01-14',
          category: 'Technical'
        }
      ];

      setSupportTopics(mockSupportTopics);
      setFaqs(mockFaqs);
      setTickets(mockTickets);
    } catch (error) {
      console.error('Error loading support data:', error);
      Alert.alert('Error', 'Failed to load support data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const createTicket = () => {
    Alert.alert('Create Ticket', 'Support ticket creation coming soon!');
  };

  const contactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose your preferred contact method:',
      [
        { text: 'Email', onPress: () => Alert.alert('Email', 'support@maschat.com') },
        { text: 'Live Chat', onPress: () => Alert.alert('Live Chat', 'Live chat coming soon!') },
        { text: 'Phone', onPress: () => Alert.alert('Phone', '+1-800-MASCHAT') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return colors.primary;
      case 'in-progress': return colors.accent;
      case 'resolved': return colors.success;
      case 'closed': return colors.lightText;
      default: return colors.primary;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return colors.success;
      case 'medium': return colors.accent;
      case 'high': return colors.bronze;
      case 'urgent': return '#FF6B6B';
      default: return colors.success;
    }
  };

  const renderSupportTopic = ({ item }: { item: SupportTopic }) => (
    <TouchableOpacity 
      style={[styles.topicCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert(item.title, item.description)}
    >
      <View style={[styles.topicIcon, { backgroundColor: item.color }]}>
        <Ionicons name={item.icon as any} size={24} color="white" />
      </View>
      <View style={styles.topicContent}>
        <Text style={[styles.topicTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.topicDescription, { color: colors.lightText }]}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.lightText} />
    </TouchableOpacity>
  );

  const renderFAQ = ({ item }: { item: FAQ }) => (
    <TouchableOpacity 
      style={[styles.faqCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert(item.question, item.answer)}
    >
      <View style={styles.faqHeader}>
        <Text style={[styles.faqQuestion, { color: colors.text }]} numberOfLines={2}>
          {item.question}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.lightText} />
      </View>
      <Text style={[styles.faqAnswer, { color: colors.lightText }]} numberOfLines={3}>
        {item.answer}
      </Text>
      <View style={styles.faqFooter}>
        <Text style={[styles.faqCategory, { color: colors.accent }]}>{item.category}</Text>
        <TouchableOpacity style={styles.helpfulButton}>
          <Ionicons 
            name={item.helpful ? "thumbs-up" : "thumbs-up-outline"} 
            size={16} 
            color={colors.primary} 
          />
          <Text style={[styles.helpfulText, { color: colors.primary }]}>Helpful</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTicket = ({ item }: { item: SupportTicket }) => (
    <TouchableOpacity 
      style={[styles.ticketCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert(item.title, item.description)}
    >
      <View style={styles.ticketHeader}>
        <Text style={[styles.ticketTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={[styles.ticketDescription, { color: colors.lightText }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.ticketFooter}>
        <View style={styles.ticketInfo}>
          <Text style={[styles.ticketCategory, { color: colors.accent }]}>{item.category}</Text>
          <Text style={[styles.ticketDate, { color: colors.lightText }]}>{item.createdAt}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
          <Text style={styles.priorityText}>{item.priority.toUpperCase()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHelp = () => (
    <View style={styles.tabContent}>
      <View style={[styles.quickActionsCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={createTicket}
          >
            <MaterialIcons name="add-circle" size={24} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Create Ticket</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={contactSupport}
          >
            <MaterialIcons name="support-agent" size={24} color={colors.accent} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Contact Us</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Live Chat', 'Live chat coming soon!')}
          >
            <MaterialIcons name="chat" size={24} color={colors.success} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Live Chat</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => Alert.alert('Email', 'support@maschat.com')}
          >
            <MaterialIcons name="email" size={24} color={colors.secondary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Email</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topicsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Help Topics</Text>
        <FlatList
          data={supportTopics}
          renderItem={renderSupportTopic}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderFAQSection = () => (
    <View style={styles.tabContent}>
      <View style={styles.faqContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
        <FlatList
          data={faqs}
          renderItem={renderFAQ}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );

  const renderTickets = () => (
    <View style={styles.tabContent}>
      <View style={styles.ticketsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>My Support Tickets</Text>
        <TouchableOpacity
          style={[styles.createTicketButton, { backgroundColor: colors.primary }]}
          onPress={createTicket}
        >
          <Ionicons name="add" size={20} color="white" />
          <Text style={styles.createTicketText}>New Ticket</Text>
        </TouchableOpacity>
      </View>
      
      {tickets.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="support-agent" size={64} color={colors.lightText} />
          <Text style={[styles.emptyText, { color: colors.lightText }]}>
            No support tickets yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  const renderContact = () => (
    <View style={styles.tabContent}>
      <View style={[styles.contactCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Support</Text>
        
        <TouchableOpacity 
          style={styles.contactOption}
          onPress={() => Alert.alert('Email Support', 'support@maschat.com')}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.primary }]}>
            <MaterialIcons name="email" size={24} color="white" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Email Support</Text>
            <Text style={[styles.contactDescription, { color: colors.lightText }]}>
              Get help via email within 24 hours
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.lightText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactOption}
          onPress={() => Alert.alert('Live Chat', 'Live chat coming soon!')}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.accent }]}>
            <MaterialIcons name="chat" size={24} color="white" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Live Chat</Text>
            <Text style={[styles.contactDescription, { color: colors.lightText }]}>
              Chat with support agents in real-time
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.lightText} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactOption}
          onPress={() => Alert.alert('Phone Support', '+1-800-MASCHAT')}
        >
          <View style={[styles.contactIcon, { backgroundColor: colors.success }]}>
            <MaterialIcons name="phone" size={24} color="white" />
          </View>
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Phone Support</Text>
            <Text style={[styles.contactDescription, { color: colors.lightText }]}>
              Call us for immediate assistance
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.lightText} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ModernHeader title="Support" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading support...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ModernHeader title="Support" showBackButton={true} />
      
      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'help' && styles.activeTab]}
          onPress={() => setActiveTab('help')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'help' ? colors.primary : colors.lightText }]}>
            Help
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'faq' && styles.activeTab]}
          onPress={() => setActiveTab('faq')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'faq' ? colors.primary : colors.lightText }]}>
            FAQ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tickets' && styles.activeTab]}
          onPress={() => setActiveTab('tickets')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'tickets' ? colors.primary : colors.lightText }]}>
            Tickets
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'contact' && styles.activeTab]}
          onPress={() => setActiveTab('contact')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'contact' ? colors.primary : colors.lightText }]}>
            Contact
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        {activeTab === 'help' && renderHelp()}
        {activeTab === 'faq' && renderFAQSection()}
        {activeTab === 'tickets' && renderTickets()}
        {activeTab === 'contact' && renderContact()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(67, 97, 238, 0.1)',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  quickActionsCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    width: (width - 72) / 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(67, 97, 238, 0.05)',
  },
  quickActionText: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  topicsContainer: {
    marginBottom: 24,
  },
  topicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  topicContent: {
    flex: 1,
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  topicDescription: {
    fontSize: 14,
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  faqFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqCategory: {
    fontSize: 12,
    fontWeight: '500',
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  helpfulText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ticketsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  createTicketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  createTicketText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  ticketCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  ticketDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketInfo: {
    flex: 1,
  },
  ticketCategory: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  ticketDate: {
    fontSize: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
}); 