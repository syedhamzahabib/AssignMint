// screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Animated,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

// Import modular components
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCards from '../components/profile/StatsCards';
import SpendingChart from '../components/profile/SpendingChart';
import TaskOverview from '../components/profile/TaskOverview';
import { ExpertsList } from '../components/profile/ExpertCard';
import { PaymentMethodsList } from '../components/profile/PaymentMethodCard';
import WalletPreview from '../components/profile/WalletPreview';
import SettingsSection from '../components/profile/SettingsSection';

// Import modals
import StatsModal from '../components/profile/modals/StatsModal';
import AchievementsModal from '../components/profile/modals/AchievementsModal';

// Enhanced Mock API with more detailed data
const ProfileAPI = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  async getUserProfile() {
    await this.delay(800);
    return {
      success: true,
      data: {
        id: 'user123',
        nickname: 'Sarah M.',
        email: 'sarah.m@example.com',
        joinDate: '2024-01-15',
        avatar: '👩‍💼',
        memberSince: 156, // days
        
        // Enhanced Requester stats
        requesterStats: {
          tasksPosted: 23,
          totalSpent: 845.50,
          avgRating: 4.8,
          completedTasks: 20,
          cancelledTasks: 2,
          disputedTasks: 1,
          avgResponseTime: '2.3 hours',
          preferredSubjects: ['Math', 'Coding', 'Writing'],
          monthlySpending: [
            { month: 'Jan', amount: 125 },
            { month: 'Feb', amount: 180 },
            { month: 'Mar', amount: 220 },
            { month: 'Apr', amount: 195 },
            { month: 'May', amount: 125.50 },
          ],
          recentActivity: [
            { date: '2025-05-23', action: 'Approved task', task: 'Python Script Debug' },
            { date: '2025-05-21', action: 'Posted new task', task: 'Statistics Analysis' },
            { date: '2025-05-19', action: 'Disputed task', task: 'Chemistry Lab Report' },
          ]
        },
        
        // Enhanced Expert stats (for dual-role users)
        expertStats: {
          tasksCompleted: 8,
          totalEarned: 285.00,
          avgRating: 4.6,
          totalReviews: 7,
          responseTime: '3.2 hours',
          completionRate: 87,
          currentBalance: 45.25,
          specialties: ['Math', 'Physics'],
        },
        
        // User preferences and profile customization
        preferences: {
          theme: 'light',
          notifications: {
            taskUpdates: true,
            messages: true,
            payments: true,
            marketing: false,
            weeklyDigest: true,
          },
          privacy: {
            profileVisible: true,
            showStats: true,
            allowMessages: true,
            showActivity: false,
          },
          communication: {
            preferredLanguage: 'English',
            timezone: 'PST',
            autoResponder: false,
          }
        },
        
        // Enhanced favorite experts with more details
        favoriteExperts: [
          { 
            id: 'exp1', 
            name: 'Alex Kumar', 
            rating: 4.9, 
            completedTasks: 15, 
            subject: 'Coding',
            lastWorked: '2025-05-20',
            totalPaid: 185.00,
            avgDeliveryTime: '1.8 days'
          },
          { 
            id: 'exp2', 
            name: 'Emily Rodriguez', 
            rating: 4.7, 
            completedTasks: 8, 
            subject: 'Writing',
            lastWorked: '2025-05-15',
            totalPaid: 120.00,
            avgDeliveryTime: '2.1 days'
          },
          { 
            id: 'exp3', 
            name: 'Dr. James Wilson', 
            rating: 4.8, 
            completedTasks: 12, 
            subject: 'Chemistry',
            lastWorked: '2025-05-10',
            totalPaid: 300.00,
            avgDeliveryTime: '3.2 days'
          },
        ],
        
        // Enhanced payment methods
        paymentMethods: [
          { 
            id: 'pm1', 
            type: 'card', 
            name: 'Visa •••• 4242', 
            isDefault: true,
            expiryMonth: 12,
            expiryYear: 2027,
            lastUsed: '2025-05-23'
          },
          { 
            id: 'pm2', 
            type: 'card', 
            name: 'Mastercard •••• 8888', 
            isDefault: false,
            expiryMonth: 8,
            expiryYear: 2026,
            lastUsed: '2025-05-15'
          },
          { 
            id: 'pm3', 
            type: 'paypal', 
            name: 'PayPal Account', 
            isDefault: false,
            email: 'sarah.m@example.com',
            lastUsed: '2025-05-01'
          },
        ],
        
        // Achievement system
        achievements: [
          { id: 'first_task', name: 'First Task Posted', icon: '🎯', unlocked: true, date: '2024-01-18' },
          { id: 'five_star', name: '5-Star Requester', icon: '⭐', unlocked: true, date: '2024-02-10' },
          { id: 'big_spender', name: 'Big Spender ($500+)', icon: '💰', unlocked: true, date: '2024-04-15' },
          { id: 'loyal_customer', name: '6 Month Member', icon: '🏆', unlocked: true, date: '2024-07-15' },
          { id: 'expert_finder', name: 'Expert Finder (10+ tasks)', icon: '🔍', unlocked: true, date: '2024-03-20' },
          { id: 'speed_poster', name: 'Speed Poster', icon: '⚡', unlocked: false, date: null },
        ],
        
        // Quick stats for dashboard
        quickStats: {
          tasksThisMonth: 5,
          avgTaskValue: 36.76,
          favoriteTimeOfDay: 'Evening',
          mostUsedSubject: 'Math',
          successRate: 95,
        }
      }
    };
  },
  
  async updateProfile(updates) {
    await this.delay(1200);
    console.log('📝 Updating profile:', updates);
    
    if (updates.nickname && updates.nickname.length < 2) {
      throw { success: false, message: 'Nickname must be at least 2 characters' };
    }
    
    return { success: true, message: 'Profile updated successfully! ✨' };
  },
  
  async toggleFavoriteExpert(expertId, shouldFavorite) {
    await this.delay(600);
    return { 
      success: true, 
      message: shouldFavorite ? 'Expert added to favorites!' : 'Expert removed from favorites' 
    };
  },
};

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('requester');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [profile, fadeAnim]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileAPI.getUserProfile();
      if (response.success) {
        setProfile(response.data);
        
        // Auto-determine tab based on activity
        const hasExpertActivity = response.data.expertStats.tasksCompleted > 0;
        const hasRequesterActivity = response.data.requesterStats.tasksPosted > 0;
        
        if (hasExpertActivity && !hasRequesterActivity) {
          setActiveTab('expert');
        } else if (hasRequesterActivity && hasExpertActivity) {
          setActiveTab(
            response.data.expertStats.tasksCompleted >= response.data.requesterStats.tasksPosted 
              ? 'expert' : 'requester'
          );
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleUpdateNickname = async (newNickname) => {
    try {
      const response = await ProfileAPI.updateProfile({ nickname: newNickname });
      if (response.success) {
        setProfile(prev => ({ ...prev, nickname: newNickname }));
        Alert.alert('Success! 🎉', response.message);
      }
    } catch (error) {
      throw error;
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'stats':
        setShowStatsModal(true);
        break;
      case 'achievements':
        setShowAchievementsModal(true);
        break;
      case 'wallet':
        navigation && navigation.navigate('Wallet');
        break;
    }
  };

  const handleFavoriteToggle = async (expertId, isFavorited) => {
    try {
      const response = await ProfileAPI.toggleFavoriteExpert(expertId, !isFavorited);
      if (response.success) {
        setProfile(prev => ({
          ...prev,
          favoriteExperts: isFavorited 
            ? prev.favoriteExperts.filter(e => e.id !== expertId)
            : [...prev.favoriteExperts]
        }));
        Alert.alert('Updated!', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  const handleHireExpert = (expert) => {
    Alert.alert(
      '🎯 Hire Expert',
      `Would you like to create a new task for ${expert.name}?\n\nThey specialize in ${expert.subject} and have completed ${expert.completedTasks} tasks with a ${expert.rating}⭐ rating.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Create Task', onPress: () => {
          // Navigate to PostScreen with expert pre-selected
          Alert.alert('Coming Soon!', 'Expert hiring integration coming soon!');
        }}
      ]
    );
  };

  const handleWalletActions = {
    onOpenWallet: () => navigation && navigation.navigate('Wallet'),
    onQuickWithdraw: () => navigation && navigation.navigate('Wallet', { action: 'withdraw' }),
  };

  const handlePaymentActions = {
    onEdit: (method) => Alert.alert('Edit Payment', `Edit ${method.name} - Coming soon!`),
    onAdd: () => Alert.alert('Add Payment', 'Add new payment method - Coming soon!'),
  };

  const handleSettingsPress = (setting) => {
    Alert.alert('Settings', `${setting} settings - Coming soon!`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>😔</Text>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTabToggle = () => (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'requester' && styles.activeTab]}
        onPress={() => setActiveTab('requester')}
      >
        <Text style={[styles.tabText, activeTab === 'requester' && styles.activeTabText]}>
          Requester ✅
        </Text>
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{profile.requesterStats.tasksPosted}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.tab, activeTab === 'expert' && styles.activeTab]}
        onPress={() => setActiveTab('expert')}
      >
        <Text style={[styles.tabText, activeTab === 'expert' && styles.activeTabText]}>
          Expert 🎓
        </Text>
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{profile.expertStats.tasksCompleted}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderRequesterView = () => (
    <Animated.View style={[styles.roleContent, { opacity: fadeAnim }]}>
      <StatsCards 
        stats={{
          tasksPosted: profile.requesterStats.tasksPosted,
          totalSpent: profile.requesterStats.totalSpent,
          avgRating: profile.requesterStats.avgRating,
          tasksThisMonth: profile.quickStats.tasksThisMonth,
          avgTaskValue: profile.quickStats.avgTaskValue,
          successRate: profile.quickStats.successRate,
        }}
        fadeAnim={fadeAnim}
      />

      <SpendingChart 
        monthlyData={profile.requesterStats.monthlySpending}
        maxAmount={250}
      />

      <TaskOverview stats={profile.requesterStats} />

      <ExpertsList
        experts={profile.favoriteExperts}
        onFavoriteToggle={handleFavoriteToggle}
        onHireAgain={handleHireExpert}
      />

      <PaymentMethodsList
        paymentMethods={profile.paymentMethods}
        onEdit={handlePaymentActions.onEdit}
        onAdd={handlePaymentActions.onAdd}
      />

      <WalletPreview
        balance={profile.expertStats.currentBalance}
        onOpenWallet={handleWalletActions.onOpenWallet}
        onQuickWithdraw={handleWalletActions.onQuickWithdraw}
      />
    </Animated.View>
  );

  const renderExpertView = () => (
    <View style={styles.expertPlaceholder}>
      <Text style={styles.placeholderText}>Expert view coming soon! 🎓</Text>
      <Text style={styles.placeholderSubtext}>
        This section will show your expert profile, earnings, and completed tasks.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2e7d32']}
          />
        }
      >
        <ProfileHeader
          profile={profile}
          fadeAnim={fadeAnim}
          onUpdateNickname={handleUpdateNickname}
          onQuickAction={handleQuickAction}
        />

        {renderTabToggle()}
        
        {activeTab === 'requester' ? renderRequesterView() : renderExpertView()}
        
        <SettingsSection
          preferences={profile.preferences}
          onSettingPress={handleSettingsPress}
        />
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modals */}
      <StatsModal
        visible={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        profile={profile}
      />

      <AchievementsModal
        visible={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
        achievements={profile.achievements}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#2e7d32',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  tabBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  roleContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  expertPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  placeholderText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ProfileScreen;