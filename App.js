import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';

// Import the complete screens
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import WalletScreen from './screens/WalletScreen'; // NEW IMPORT

// Mock API Service (same as before)
const TasksAPI = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  async getTasksByRole(role) {
    await this.delay(500 + Math.random() * 500);
    
    const requesterTasks = [
      {
        id: 'req_1',
        title: 'Solve 10 Calculus Problems',
        dueDate: '2025-05-25',
        status: 'in_progress',
        expertName: 'Sarah Chen',
        subject: 'Math',
        price: '$20',
        urgency: 'medium',
        progress: 65,
      },
      {
        id: 'req_2',
        title: 'Fix bugs in Python script',
        dueDate: '2025-05-22',
        status: 'pending_review',
        expertName: 'Alex Kumar',
        subject: 'Coding',
        price: '$30',
        urgency: 'high',
        progress: 100,
      },
      {
        id: 'req_3',
        title: 'Write 500-word essay on Civil War',
        dueDate: '2025-05-24',
        status: 'completed',
        expertName: 'Emily Rodriguez',
        subject: 'Writing',
        price: '$15',
        urgency: 'low',
        progress: 100,
      },
      {
        id: 'req_4',
        title: 'Design a logo for student group',
        dueDate: '2025-05-26',
        status: 'awaiting_expert',
        expertName: null,
        subject: 'Design',
        price: '$18',
        urgency: 'medium',
        progress: 0,
      },
    ];

    const expertTasks = [
      {
        id: 'exp_1',
        title: 'Translate English to Spanish document',
        dueDate: '2025-05-27',
        status: 'working',
        requesterName: 'John Smith',
        subject: 'Language',
        price: '$22',
        progress: 45,
        urgency: 'medium',
      },
      {
        id: 'exp_2',
        title: 'Build basic website in HTML/CSS',
        dueDate: '2025-05-28',
        status: 'delivered',
        requesterName: 'Maria Garcia',
        subject: 'Coding',
        price: '$40',
        progress: 100,
        urgency: 'low',
      },
      {
        id: 'exp_3',
        title: 'Chemistry Lab Report Analysis',
        dueDate: '2025-05-24',
        status: 'revision_requested',
        requesterName: 'David Park',
        subject: 'Chemistry',
        price: '$25',
        progress: 85,
        urgency: 'high',
      },
    ];

    return {
      success: true,
      data: role === 'requester' ? requesterTasks : expertTasks,
    };
  },

  async getTaskStats(role) {
    await this.delay(200);
    
    const tasks = role === 'requester' ? 4 : 3;
    return {
      success: true,
      data: {
        total: tasks,
        active: role === 'requester' ? 2 : 2,
        completed: 1,
        overdue: 0,
      }
    };
  },

  async submitTaskAction(taskId, action, role) {
    await this.delay(800);
    
    const messages = {
      review: 'Task approved successfully! Payment has been released to the expert.',
      dispute: 'Dispute filed successfully. Our team will review within 24 hours.',
      cancel: 'Task cancelled successfully. Refund will be processed within 24 hours.',
      upload: 'Files uploaded successfully! The requester will be notified to review.',
      edit: 'Task updated successfully. Changes are now live.',
    };

    return {
      success: true,
      message: messages[action] || 'Action completed successfully',
      data: { taskId, action, newStatus: 'updated' }
    };
  }
};

// Enhanced Task Card Component
const TaskCard = ({ task, onPress, onAction, isRequester, isLoading }) => {
  const getStatusInfo = (status) => {
    const statusMap = {
      in_progress: { text: '🔄 In Progress', color: '#2196f3', bgColor: '#e3f2fd' },
      pending_review: { text: '⏳ Pending Review', color: '#ff9800', bgColor: '#fff3e0' },
      completed: { text: '✅ Completed', color: '#4caf50', bgColor: '#e8f5e8' },
      awaiting_expert: { text: '👀 Finding Expert', color: '#9c27b0', bgColor: '#f3e5f5' },
      working: { text: '🔨 Working', color: '#2196f3', bgColor: '#e3f2fd' },
      delivered: { text: '📤 Delivered', color: '#ff9800', bgColor: '#fff3e0' },
      revision_requested: { text: '🔄 Revision Requested', color: '#ff5722', bgColor: '#fbe9e7' },
    };
    return statusMap[status] || { text: status, color: '#666', bgColor: '#f5f5f5' };
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'high': return { backgroundColor: '#ffebee', color: '#f44336', icon: '🔥' };
      case 'medium': return { backgroundColor: '#fff3e0', color: '#ff9800', icon: '⚡' };
      case 'low': return { backgroundColor: '#e8f5e8', color: '#4caf50', icon: '🌱' };
      default: return { backgroundColor: '#f5f5f5', color: '#757575', icon: '📋' };
    }
  };

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isUrgent: true };
    if (diffDays === 1) return { text: '1 day left', isUrgent: true };
    return { text: `${diffDays} days left`, isNormal: true };
  };

  const statusInfo = getStatusInfo(task.status);
  const urgencyStyle = getUrgencyStyle(task.urgency);
  const daysLeftInfo = calculateDaysLeft(task.dueDate);

  return (
    <TouchableOpacity style={styles.taskCard} onPress={() => onPress(task)}>
      {/* Task Header */}
      <View style={styles.taskHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.taskTitle}>📌 {task.title}</Text>
          {task.urgency && (
            <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyle.backgroundColor }]}>
              <Text style={[styles.urgencyText, { color: urgencyStyle.color }]}>
                {urgencyStyle.icon} {task.urgency.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.taskPrice}>{task.price}</Text>
      </View>

      {/* Due Date */}
      <View style={styles.dueDateContainer}>
        <Text style={styles.dueDateLabel}>📅 Due: {task.dueDate}</Text>
        <View style={[
          styles.daysLeftBadge,
          daysLeftInfo.isOverdue && styles.overdueBadge,
          daysLeftInfo.isUrgent && styles.urgentBadge,
          daysLeftInfo.isNormal && styles.normalBadge
        ]}>
          <Text style={[
            styles.daysLeftText,
            daysLeftInfo.isOverdue && styles.overdueText,
            daysLeftInfo.isUrgent && styles.urgentText,
            daysLeftInfo.isNormal && styles.normalText
          ]}>
            {daysLeftInfo.text}
          </Text>
        </View>
      </View>

      {/* Progress for Expert tasks */}
      {!isRequester && task.progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progress</Text>
            <Text style={styles.progressValue}>{task.progress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
          </View>
        </View>
      )}

      {/* Person Info */}
      <Text style={styles.personInfo}>
        {isRequester 
          ? (task.expertName ? `👤 Expert: ${task.expertName}` : '👀 No expert assigned')
          : `👤 Requester: ${task.requesterName}`
        }
      </Text>

      {/* Status */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>

      {/* Tap Indicator */}
      <View style={styles.tapIndicator}>
        <Text style={styles.tapIndicatorText}>👆 Tap for details</Text>
      </View>

      {/* Action Buttons */}
      {renderActionButtons(task, isRequester, onAction, isLoading)}
    </TouchableOpacity>
  );
};

// Action Buttons Helper
const renderActionButtons = (task, isRequester, onAction, isLoading) => {
  if (isRequester) {
    switch (task.status) {
      case 'pending_review':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn]}
              onPress={() => onAction('review', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>✅ Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.disputeBtn]}
              onPress={() => onAction('dispute', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>🚩 Dispute</Text>
            </TouchableOpacity>
          </View>
        );
      case 'in_progress':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={() => onAction('cancel', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>❌ Cancel</Text>
            </TouchableOpacity>
          </View>
        );
      case 'awaiting_expert':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => onAction('edit', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>🟨 Edit</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  } else {
    // Expert actions
    switch (task.status) {
      case 'working':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.uploadBtn]}
              onPress={() => onAction('upload', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>🟩 Upload</Text>
            </TouchableOpacity>
          </View>
        );
      case 'revision_requested':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.uploadBtn]}
              onPress={() => onAction('upload', task)}
              disabled={isLoading}
            >
              <Text style={styles.actionBtnText}>🔄 Revise</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  }
};

// Main App Component
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [myTasksTab, setMyTasksTab] = useState('requester');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', buttons: [] });

  // NEW: Wallet navigation state
  const [showWallet, setShowWallet] = useState(false);
  const [walletParams, setWalletParams] = useState({});

  // Mock notification count - you can make this dynamic later
  const [unreadNotifications] = useState(3);

  // NEW: Navigation object for wallet integration
  const navigation = {
    navigate: (screenName, params = {}) => {
      console.log(`🧭 Navigating to: ${screenName}`, params);
      if (screenName === 'Wallet') {
        setWalletParams(params || {});
        setShowWallet(true);
      }
    },
    goBack: () => {
      console.log('🧭 Going back from wallet');
      setShowWallet(false);
      setWalletParams({});
    }
  };

  // Load My Tasks data when tab changes
  useEffect(() => {
    if (activeTab === 'tasks') {
      loadMyTasks();
      loadStats();
    }
  }, [activeTab, myTasksTab]);

  const loadMyTasks = async () => {
    try {
      setLoading(true);
      const response = await TasksAPI.getTasksByRole(myTasksTab);
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await TasksAPI.getTaskStats(myTasksTab);
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.log('Failed to load stats');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMyTasks(), loadStats()]);
    setRefreshing(false);
  }, [myTasksTab]);

  const showCustomModal = (title, message, buttons = []) => {
    setModalData({ title, message, buttons });
    setShowModal(true);
  };

  const handleTaskPress = (task) => {
    Alert.alert(
      'Task Details',
      `Title: ${task.title}\nPrice: ${task.price}\nStatus: ${task.status}\nDue: ${task.dueDate}`,
      [{ text: 'OK' }]
    );
  };

  const handleAction = async (action, task) => {
    const actionMessages = {
      review: `Approve task "${task.title}"?\n\nThis will release payment to the expert.`,
      dispute: `File dispute for "${task.title}"?\n\nOur team will review within 24 hours.`,
      cancel: `Cancel task "${task.title}"?\n\nThis action cannot be undone.`,
      upload: `Upload delivery for "${task.title}"?\n\nThe requester will be notified.`,
      edit: `Edit task "${task.title}"?\n\nYou can modify requirements and deadline.`,
    };

    showCustomModal(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Task`,
      actionMessages[action] || `${action} for "${task.title}"`,
      [
        { text: 'Cancel', onPress: () => setShowModal(false) },
        { text: 'Confirm', onPress: () => submitAction(action, task) }
      ]
    );
  };

  const submitAction = async (action, task) => {
    try {
      setActionLoading(true);
      setShowModal(false);
      
      const response = await TasksAPI.submitTaskAction(task.id, action, myTasksTab);
      
      if (response.success) {
        Alert.alert('Success!', response.message);
        // Refresh tasks after action
        loadMyTasks();
      }
    } catch (error) {
      Alert.alert('Error', 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderMyTasksScreen = () => (
    <View style={styles.screen}>
      <Text style={styles.screenTitle}>📂 My Tasks</Text>
      
      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.roleTab, myTasksTab === 'requester' && styles.activeRoleTab]}
          onPress={() => setMyTasksTab('requester')}
        >
          <Text style={[styles.roleTabText, myTasksTab === 'requester' && styles.activeRoleTabText]}>
            Requester ✅
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleTab, myTasksTab === 'expert' && styles.activeRoleTab]}
          onPress={() => setMyTasksTab('expert')}
        >
          <Text style={[styles.roleTabText, myTasksTab === 'expert' && styles.activeRoleTabText]}>
            Expert 🎓
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.overdue}</Text>
          <Text style={styles.statLabel}>Overdue</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          💡 Pull down to refresh • Tap cards for details • Tap buttons for actions
        </Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={handleTaskPress}
              onAction={handleAction}
              isRequester={myTasksTab === 'requester'}
              isLoading={actionLoading}
            />
          )}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2e7d32']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>
                {myTasksTab === 'requester' 
                  ? 'You haven\'t posted any tasks yet'
                  : 'You haven\'t accepted any tasks yet'
                }
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const renderProfileScreen = () => <ProfileScreen navigation={navigation} />;

  const renderCurrentScreen = () => {
    // NEW: Handle wallet screen
    if (showWallet) {
      return <WalletScreen navigation={navigation} route={{ params: walletParams }} />;
    }

    // Original screen logic
    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'post':
        return <PostScreen />;
      case 'tasks':
        return renderMyTasksScreen();
      case 'notifications':
        return <NotificationsScreen navigation={navigation} />;
      case 'profile':
        return renderProfileScreen();
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task Management App</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderCurrentScreen()}
      </View>

      {/* Bottom Tab Bar - Only show if not on wallet screen */}
      {!showWallet && (
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'home' && styles.activeTabBarItem]}
            onPress={() => setActiveTab('home')}
          >
            <Text style={styles.tabBarIcon}>🏠</Text>
            <Text style={[styles.tabBarLabel, activeTab === 'home' && styles.activeTabBarLabel]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'post' && styles.activeTabBarItem]}
            onPress={() => setActiveTab('post')}
          >
            <Text style={styles.tabBarIcon}>➕</Text>
            <Text style={[styles.tabBarLabel, activeTab === 'post' && styles.activeTabBarLabel]}>
              Post
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'tasks' && styles.activeTabBarItem]}
            onPress={() => setActiveTab('tasks')}
          >
            <Text style={styles.tabBarIcon}>📋</Text>
            <Text style={[styles.tabBarLabel, activeTab === 'tasks' && styles.activeTabBarLabel]}>
              My Tasks
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'notifications' && styles.activeTabBarItem]}
            onPress={() => setActiveTab('notifications')}
          >
            <View style={styles.tabBarIconContainer}>
              <Text style={styles.tabBarIcon}>🔔</Text>
              {unreadNotifications > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadNotifications}</Text>
                </View>
              )}
            </View>
            <Text style={[styles.tabBarLabel, activeTab === 'notifications' && styles.activeTabBarLabel]}>
              Notifications
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBarItem, activeTab === 'profile' && styles.activeTabBarItem]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={styles.tabBarIcon}>👤</Text>
            <Text style={[styles.tabBarLabel, activeTab === 'profile' && styles.activeTabBarLabel]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalMessage}>{modalData.message}</Text>
            
            <View style={styles.modalButtons}>
              {modalData.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalButton}
                  onPress={button.onPress}
                >
                  <Text style={styles.modalButtonText}>{button.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Complete Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  screen: {
    flex: 1,
    padding: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  // Task List Styles
  taskList: {
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
    lineHeight: 22,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2e7d32',
  },
  dueDateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDateLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  daysLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  normalBadge: {
    backgroundColor: '#e8f5e8',
  },
  urgentBadge: {
    backgroundColor: '#fff3e0',
  },
  overdueBadge: {
    backgroundColor: '#ffebee',
  },
  daysLeftText: {
    fontSize: 12,
    fontWeight: '600',
  },
  normalText: {
    color: '#4caf50',
  },
  urgentText: {
    color: '#ff9800',
  },
  overdueText: {
    color: '#f44336',
  },
  
  // Progress Styles
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 2,
  },
  
  personInfo: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tapIndicator: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  tapIndicatorText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  
  // Action Button Styles
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  approveBtn: { backgroundColor: '#4caf50' },
  disputeBtn: { backgroundColor: '#ff5722' },
  cancelBtn: { backgroundColor: '#f44336' },
  editBtn: { backgroundColor: '#ff9800' },
  uploadBtn: { backgroundColor: '#2e7d32' },
  
  // Role Tab Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  roleTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeRoleTab: {
    backgroundColor: '#2e7d32',
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeRoleTabText: {
    color: '#fff',
  },
  
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Instructions
  instructionContainer: {
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 13,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Loading & Empty States
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
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 5,
    paddingTop: 10,
  },
  tabBarItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  tabBarIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  activeTabBarItem: {
    // Add any specific styling for active tab if needed
  },
  activeTabBarLabel: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  
  // Notification Badge Styles
  tabBarIconContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2e7d32',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});