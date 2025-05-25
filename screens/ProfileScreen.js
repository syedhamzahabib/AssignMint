import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

// Mock API calls - you can replace these with your actual API
const ProfileAPI = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  async getUserProfile() {
    await this.delay(500);
    return {
      success: true,
      data: {
        id: 'user123',
        nickname: 'Sarah M.',
        email: 'sarah.m@example.com',
        joinDate: '2024-01-15',
        avatar: '👩‍💼',
        
        // Requester stats
        requesterStats: {
          tasksPosted: 12,
          totalSpent: 450,
          avgRating: 4.8,
          completedTasks: 10,
          cancelledTasks: 1,
          disputedTasks: 1,
        },
        
        // Expert stats  
        expertStats: {
          tasksCompleted: 25,
          totalEarned: 680,
          avgRating: 4.9,
          totalReviews: 23,
          responseTime: '2 hours',
          completionRate: 96,
          currentBalance: 125.50,
        },
        
        expertBio: 'Experienced in Math, Physics, and Computer Science. I help students understand complex concepts with clear explanations and step-by-step solutions.',
        
        favoriteExperts: [
          { id: 'exp1', name: 'Alex Kumar', rating: 4.9, completedTasks: 15, subject: 'Coding' },
          { id: 'exp2', name: 'Emily Rodriguez', rating: 4.7, completedTasks: 8, subject: 'Writing' },
          { id: 'exp3', name: 'Dr. James Wilson', rating: 4.8, completedTasks: 12, subject: 'Chemistry' },
        ],
        
        paymentMethods: [
          { id: 'pm1', type: 'card', name: 'Visa •••• 4242', isDefault: true },
          { id: 'pm2', type: 'card', name: 'Mastercard •••• 8888', isDefault: false },
          { id: 'pm3', type: 'paypal', name: 'PayPal Account', isDefault: false },
        ],
        
        recentReviews: [
          {
            id: 'rev1',
            rating: 5,
            comment: 'Excellent work! Very detailed explanations and delivered on time.',
            taskTitle: 'Calculus Problems',
            date: '2025-01-20',
            requesterName: 'John D.'
          },
          {
            id: 'rev2', 
            rating: 4,
            comment: 'Good work, but could have been faster.',
            taskTitle: 'Python Debugging',
            date: '2025-01-18',
            requesterName: 'Maria G.'
          },
          {
            id: 'rev3',
            rating: 5,
            comment: 'Perfect! Exactly what I needed.',
            taskTitle: 'Essay Writing',
            date: '2025-01-15',
            requesterName: 'David P.'
          },
        ],
        
        settings: {
          notifications: {
            taskUpdates: true,
            messages: true,
            payments: true,
            marketing: false,
          },
          privacy: {
            profileVisible: true,
            showStats: true,
            allowMessages: true,
          }
        }
      }
    };
  },
  
  async updateProfile(updates) {
    await this.delay(800);
    console.log('📝 Updating profile:', updates);
    return { success: true, message: 'Profile updated successfully!' };
  },
  
  async withdrawFunds(amount) {
    await this.delay(1000);
    if (amount > 125.50) {
      throw { success: false, message: 'Insufficient balance' };
    }
    return { success: true, message: `$${amount} withdrawal request submitted!` };
  }
};

const ProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('requester'); // Will be determined by user activity
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  // Determine default tab based on user activity
  useEffect(() => {
    if (profile) {
      const hasExpertActivity = profile.expertStats.tasksCompleted > 0;
      const hasRequesterActivity = profile.requesterStats.tasksPosted > 0;
      
      if (hasExpertActivity && !hasRequesterActivity) {
        setActiveTab('expert');
      } else if (hasRequesterActivity && hasExpertActivity) {
        // More expert activity - default to expert
        setActiveTab(profile.expertStats.tasksCompleted >= profile.requesterStats.tasksPosted ? 'expert' : 'requester');
      }
      // Default stays 'requester' if no clear preference
    }
  }, [profile]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await ProfileAPI.getUserProfile();
      if (response.success) {
        setProfile(response.data);
        setNewNickname(response.data.nickname);
        setNewBio(response.data.expertBio);
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

  const handleUpdateNickname = async () => {
    if (!newNickname.trim()) {
      Alert.alert('Error', 'Nickname cannot be empty');
      return;
    }
    
    try {
      const response = await ProfileAPI.updateProfile({ nickname: newNickname.trim() });
      if (response.success) {
        setProfile(prev => ({ ...prev, nickname: newNickname.trim() }));
        setEditingNickname(false);
        Alert.alert('Success', 'Nickname updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update nickname');
    }
  };

  const handleUpdateBio = async () => {
    try {
      const response = await ProfileAPI.updateProfile({ expertBio: newBio });
      if (response.success) {
        setProfile(prev => ({ ...prev, expertBio: newBio }));
        setEditingBio(false);
        Alert.alert('Success', 'Bio updated!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      const response = await ProfileAPI.withdrawFunds(amount);
      if (response.success) {
        setProfile(prev => ({
          ...prev,
          expertStats: {
            ...prev.expertStats,
            currentBalance: prev.expertStats.currentBalance - amount
          }
        }));
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        Alert.alert('Success', response.message);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Withdrawal failed');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic here
            Alert.alert('Logged Out', 'You have been logged out successfully');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{profile.avatar}</Text>
        </View>
        <View style={styles.userInfo}>
          {editingNickname ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={newNickname}
                onChangeText={setNewNickname}
                placeholder="Enter nickname"
                maxLength={30}
              />
              <View style={styles.editButtons}>
                <TouchableOpacity onPress={() => setEditingNickname(false)}>
                  <Text style={styles.cancelButton}>❌</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleUpdateNickname}>
                  <Text style={styles.saveButton}>✅</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.nicknameContainer} 
              onPress={() => setEditingNickname(true)}
            >
              <Text style={styles.nickname}>{profile.nickname}</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.joinDate}>Joined {new Date(profile.joinDate).toLocaleDateString()}</Text>
        </View>
      </View>
    </View>
  );

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
    <View style={styles.roleContent}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.requesterStats.tasksPosted}</Text>
          <Text style={styles.statLabel}>Tasks Posted</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${profile.requesterStats.totalSpent}</Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.requesterStats.avgRating}⭐</Text>
          <Text style={styles.statLabel}>Avg Rating</Text>
        </View>
      </View>

      {/* Task History Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Task History</Text>
        <View style={styles.historyGrid}>
          <View style={styles.historyItem}>
            <Text style={styles.historyNumber}>{profile.requesterStats.completedTasks}</Text>
            <Text style={styles.historyLabel}>Completed</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyNumber}>{profile.requesterStats.cancelledTasks}</Text>
            <Text style={styles.historyLabel}>Cancelled</Text>
          </View>
          <View style={styles.historyItem}>
            <Text style={styles.historyNumber}>{profile.requesterStats.disputedTasks}</Text>
            <Text style={styles.historyLabel}>Disputed</Text>
          </View>
        </View>
      </View>

      {/* Favorite Experts */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Favorite Experts</Text>
        {profile.favoriteExperts.map((expert) => (
          <View key={expert.id} style={styles.expertCard}>
            <View style={styles.expertInfo}>
              <Text style={styles.expertName}>{expert.name}</Text>
              <Text style={styles.expertSubject}>{expert.subject}</Text>
            </View>
            <View style={styles.expertStats}>
              <Text style={styles.expertRating}>{expert.rating}⭐</Text>
              <Text style={styles.expertTasks}>{expert.completedTasks} tasks</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>💳 Payment Methods</Text>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {profile.paymentMethods.map((method) => (
          <View key={method.id} style={styles.paymentCard}>
            <Text style={styles.paymentIcon}>
              {method.type === 'card' ? '💳' : '🅿️'}
            </Text>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>{method.name}</Text>
              {method.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
            </View>
            <TouchableOpacity>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  const renderExpertView = () => (
    <View style={styles.roleContent}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.expertStats.tasksCompleted}</Text>
          <Text style={styles.statLabel}>Tasks Done</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>${profile.expertStats.totalEarned}</Text>
          <Text style={styles.statLabel}>Total Earned</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{profile.expertStats.avgRating}⭐</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>

      {/* Balance & Withdraw */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 Current Balance</Text>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceAmount}>${profile.expertStats.currentBalance.toFixed(2)}</Text>
          <TouchableOpacity 
            style={styles.withdrawButton}
            onPress={() => setShowWithdrawModal(true)}
          >
            <Text style={styles.withdrawButtonText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expert Bio */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📝 Expert Bio</Text>
          <TouchableOpacity onPress={() => setEditingBio(true)}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
        {editingBio ? (
          <View style={styles.bioEditContainer}>
            <TextInput
              style={styles.bioInput}
              value={newBio}
              onChangeText={setNewBio}
              placeholder="Describe your expertise..."
              multiline
              numberOfLines={4}
              maxLength={500}
            />
            <Text style={styles.charCount}>{newBio.length}/500</Text>
            <View style={styles.bioButtons}>
              <TouchableOpacity 
                style={styles.bioCancel}
                onPress={() => {
                  setEditingBio(false);
                  setNewBio(profile.expertBio);
                }}
              >
                <Text style={styles.bioCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.bioSave}
                onPress={handleUpdateBio}
              >
                <Text style={styles.bioSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.bioText}>{profile.expertBio}</Text>
        )}
      </View>

      {/* Performance Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Performance</Text>
        <View style={styles.performanceGrid}>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceNumber}>{profile.expertStats.totalReviews}</Text>
            <Text style={styles.performanceLabel}>Reviews</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceNumber}>{profile.expertStats.responseTime}</Text>
            <Text style={styles.performanceLabel}>Avg Response</Text>
          </View>
          <View style={styles.performanceItem}>
            <Text style={styles.performanceNumber}>{profile.expertStats.completionRate}%</Text>
            <Text style={styles.performanceLabel}>Completion Rate</Text>
          </View>
        </View>
      </View>

      {/* Recent Reviews */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Recent Reviews</Text>
        {profile.recentReviews.map((review) => (
          <View key={review.id} style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={styles.reviewRating}>
                <Text style={styles.reviewStars}>{'⭐'.repeat(review.rating)}</Text>
                <Text style={styles.reviewDate}>{new Date(review.date).toLocaleDateString()}</Text>
              </View>
              <Text style={styles.reviewAuthor}>{review.requesterName}</Text>
            </View>
            <Text style={styles.reviewTask}>{review.taskTitle}</Text>
            <Text style={styles.reviewComment}>"{review.comment}"</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSharedSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>⚙️ Settings</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>🔔</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingName}>Notifications</Text>
          <Text style={styles.settingDesc}>Manage your notification preferences</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>🔒</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingName}>Privacy & Security</Text>
          <Text style={styles.settingDesc}>Account security and privacy settings</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <Text style={styles.settingIcon}>❓</Text>
        <View style={styles.settingInfo}>
          <Text style={styles.settingName}>Help & Support</Text>
          <Text style={styles.settingDesc}>Get help and contact support</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
        <Text style={styles.settingIcon}>🚪</Text>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingName, styles.logoutText]}>Logout</Text>
          <Text style={styles.settingDesc}>Sign out of your account</Text>
        </View>
        <Text style={styles.settingArrow}>›</Text>
      </TouchableOpacity>
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
        {renderHeader()}
        {renderTabToggle()}
        
        {activeTab === 'requester' ? renderRequesterView() : renderExpertView()}
        
        {renderSharedSettings()}
        
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>💰 Withdraw Funds</Text>
            <Text style={styles.modalSubtitle}>
              Available balance: ${profile.expertStats.currentBalance.toFixed(2)}
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount to withdraw:</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountField}
                  value={withdrawAmount}
                  onChangeText={setWithdrawAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancel}
                onPress={() => {
                  setShowWithdrawModal(false);
                  setWithdrawAmount('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirm}
                onPress={handleWithdraw}
              >
                <Text style={styles.modalConfirmText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
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
  
  // Header Styles
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    fontSize: 36,
  },
  userInfo: {
    flex: 1,
  },
  nicknameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  nickname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginRight: 8,
  },
  editIcon: {
    fontSize: 16,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 14,
    color: '#999',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelButton: {
    fontSize: 18,
    paddingHorizontal: 8,
  },
  saveButton: {
    fontSize: 18,
    paddingHorizontal: 8,
  },

  // Tab Styles
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

  // Content Styles
  roleContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Section Styles
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  editText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },

  // History Grid
  historyGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  historyItem: {
    alignItems: 'center',
  },
  historyNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  historyLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },

  // Expert Cards
  expertCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  expertSubject: {
    fontSize: 14,
    color: '#666',
  },
  expertStats: {
    alignItems: 'flex-end',
  },
  expertRating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 2,
  },
  expertTasks: {
    fontSize: 12,
    color: '#999',
  },

  // Payment Cards
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentName: {
    fontSize: 16,
    color: '#111',
    fontWeight: '500',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#2e7d32',
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    textTransform: 'uppercase',
  },

  // Balance Card
  balanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2e7d32',
  },
  withdrawButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  withdrawButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Bio Styles
  bioText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  bioEditContainer: {
    gap: 8,
  },
  bioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  bioButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  bioCancel: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bioCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  bioSave: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bioSaveText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Performance Grid
  performanceGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  performanceItem: {
    alignItems: 'center',
  },
  performanceNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  // Review Cards
  reviewCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4caf50',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewStars: {
    fontSize: 14,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewAuthor: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reviewTask: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '600',
    marginBottom: 4,
  },
  reviewComment: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },

  // Settings Styles
  settingsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 14,
    color: '#666',
  },
  settingArrow: {
    fontSize: 18,
    color: '#ccc',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#f44336',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginRight: 8,
  },
  amountField: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalConfirm: {
    flex: 1,
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default ProfileScreen;