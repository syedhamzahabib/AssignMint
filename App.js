import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import { TasksAPI } from './api/tasks';

const Tab = createBottomTabNavigator();

// 🎯 Enhanced MyTasksScreen with API Integration
const MyTasksScreen = ({ navigation }) => {
  // State management
  const [activeTab, setActiveTab] = useState('requester');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', buttons: [] });
  const [actionLoading, setActionLoading] = useState(false);

  // Load tasks when component mounts or tab changes
  useEffect(() => {
    loadTasks();
    loadStats();
  }, [activeTab]);

  // 📡 Load tasks from API
  const loadTasks = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
        setError(null);
      }
      
      console.log(`🔄 Loading ${activeTab} tasks...`);
      const response = await TasksAPI.getTasksByRole(activeTab);
      
      if (response.success) {
        setTasks(response.data);
        console.log(`✅ Loaded ${response.data.length} tasks`);
      }
    } catch (error) {
      console.error('❌ Failed to load tasks:', error);
      setError(error.message || 'Failed to load tasks');
      
      // Show user-friendly error message
      showCustomModal(
        '❌ Loading Error',
        'Failed to load your tasks. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: () => { setShowModal(false); loadTasks(); } },
          { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) }
        ]
      );
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // 📊 Load statistics from API
  const loadStats = async () => {
    try {
      const response = await TasksAPI.getTaskStats(activeTab);
      if (response.success) {
        setStats(response.data);
        console.log(`📊 Stats loaded:`, response.data);
      }
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
      // Don't show error for stats - not critical
    }
  };

  // 🔄 Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadTasks(false),
      loadStats()
    ]);
    setRefreshing(false);
  }, [activeTab]);

  // 🎯 Handle tab change
  const handleTabChange = (tab) => {
    console.log(`🔀 Switching to ${tab} tab`);
    setActiveTab(tab);
    setError(null);
  };

  // 📱 Custom Modal Function
  const showCustomModal = (title, message, buttons = []) => {
    setModalData({ title, message, buttons });
    setShowModal(true);
  };

  // 🔥 Enhanced Action Handler with API integration
  const handleAction = async (action, task) => {
    console.log(`🎬 Action: ${action} for task: ${task.title}`);
    
    switch (action) {
      case 'review':
        showCustomModal(
          '✅ Review & Approve',
          `Task: "${task.title}"\nPrice: ${task.price}\nExpert: ${task.expertName}\n\nApprove this completed work?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Approve ✅', 
              style: 'primary',
              onPress: () => submitAction(action, task)
            }
          ]
        );
        break;
        
      case 'dispute':
        showCustomModal(
          '🚩 File Dispute',
          `Task: "${task.title}"\nExpert: ${task.expertName}\n\nFile a dispute about the quality of work?\n\nOur team will review your case within 24 hours.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'File Dispute 🚩', 
              style: 'destructive',
              onPress: () => submitAction(action, task)
            }
          ]
        );
        break;
        
      case 'cancel':
        showCustomModal(
          '❌ Cancel Task',
          `Task: "${task.title}"\nPrice: ${task.price}\n\n⚠️ Warning: This action cannot be undone.\n\nRefund will be processed within 24 hours.`,
          [
            { text: 'Keep Task', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Cancel Task ❌', 
              style: 'destructive',
              onPress: () => submitAction(action, task)
            }
          ]
        );
        break;
        
      case 'upload':
        showCustomModal(
          '🟩 Upload Delivery',
          `Task: "${task.title}"\nRequester: ${task.requesterName}\n\nReady to upload your completed work?\n\nMake sure all requirements are met.`,
          [
            { text: 'Not Ready', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Upload Files 📁', 
              style: 'primary',
              onPress: () => submitAction(action, task)
            }
          ]
        );
        break;
        
      case 'edit':
        showCustomModal(
          '🟨 Edit Task', 
          `Edit "${task.title}"\n\nThis would open the task editor where you can modify requirements, deadline, or budget.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { text: 'Edit Task 🟨', onPress: () => setShowModal(false) }
          ]
        );
        break;
        
      default:
        showCustomModal(
          'Action', 
          `${action} for "${task.title}"`,
          [{ text: 'OK', onPress: () => setShowModal(false) }]
        );
    }
  };

  // 🚀 Submit action to API
  const submitAction = async (action, task) => {
    try {
      setActionLoading(true);
      setShowModal(false);
      
      console.log(`🚀 Submitting ${action} to API...`);
      
      // Show loading modal
      showCustomModal(
        '⏳ Processing...',
        `Processing your ${action} request...`,
        []
      );
      
      const response = await TasksAPI.submitTaskAction(task.id, action, activeTab);
      
      setShowModal(false);
      
      if (response.success) {
        // Show success message
        setTimeout(() => {
          showCustomModal(
            '✅ Success!',
            response.message,
            [{ text: 'OK', onPress: () => { setShowModal(false); onRefresh(); } }]
          );
        }, 300);
      }
    } catch (error) {
      console.error(`❌ ${action} failed:`, error);
      setShowModal(false);
      
      setTimeout(() => {
        showCustomModal(
          '❌ Action Failed',
          error.message || `Failed to ${action} task. Please try again.`,
          [
            { text: 'Retry', onPress: () => { setShowModal(false); submitAction(action, task); } },
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) }
          ]
        );
      }, 300);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate days left until due date
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

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      // Requester statuses
      in_progress: { text: '🔄 In Progress', color: '#2196f3', bgColor: '#e3f2fd' },
      pending_review: { text: '⏳ Pending Review', color: '#ff9800', bgColor: '#fff3e0' },
      completed: { text: '✅ Completed', color: '#4caf50', bgColor: '#e8f5e8' },
      awaiting_expert: { text: '👀 Finding Expert', color: '#9c27b0', bgColor: '#f3e5f5' },
      disputed: { text: '⚠️ Disputed', color: '#f44336', bgColor: '#ffebee' },
      cancelled: { text: '❌ Cancelled', color: '#757575', bgColor: '#f5f5f5' },
      
      // Expert statuses
      working: { text: '🔨 Working', color: '#2196f3', bgColor: '#e3f2fd' },
      delivered: { text: '📤 Delivered', color: '#ff9800', bgColor: '#fff3e0' },
      payment_received: { text: '💰 Payment Received', color: '#4caf50', bgColor: '#e8f5e8' },
      revision_requested: { text: '🔄 Revision Requested', color: '#ff5722', bgColor: '#fbe9e7' },
    };
    
    return statusMap[status] || { text: status, color: '#757575', bgColor: '#f5f5f5' };
  };

  // Render action buttons based on status and role
  const renderActionButtons = (task, isRequester) => {
    if (isRequester) {
      switch (task.status) {
        case 'pending_review':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleAction('review', task)}
                disabled={actionLoading}
              >
                <Text style={styles.actionBtnText}>✅ Review & Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.disputeBtn]}
                onPress={() => handleAction('dispute', task)}
                disabled={actionLoading}
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
                onPress={() => handleAction('cancel', task)}
                disabled={actionLoading}
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
                onPress={() => handleAction('edit', task)}
                disabled={actionLoading}
              >
                <Text style={styles.actionBtnText}>🟨 Edit Task</Text>
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
                onPress={() => handleAction('upload', task)}
                disabled={actionLoading}
              >
                <Text style={styles.actionBtnText}>🟩 Upload Delivery</Text>
              </TouchableOpacity>
            </View>
          );
        case 'revision_requested':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.uploadBtn]}
                onPress={() => handleAction('upload', task)}
                disabled={actionLoading}
              >
                <Text style={styles.actionBtnText}>🔄 Submit Revision</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    }
  };

  // Helper functions for urgency styling
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'high': return { backgroundColor: '#ffebee' };
      case 'medium': return { backgroundColor: '#fff3e0' };
      case 'low': return { backgroundColor: '#e8f5e8' };
      default: return { backgroundColor: '#f5f5f5' };
    }
  };

  const getUrgencyTextStyle = (urgency) => {
    switch (urgency) {
      case 'high': return { color: '#f44336' };
      case 'medium': return { color: '#ff9800' };
      case 'low': return { color: '#4caf50' };
      default: return { color: '#757575' };
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '📋';
    }
  };

  // Render enhanced task card
  const renderTaskCard = ({ item }) => {
    const isRequester = activeTab === 'requester';
    const statusInfo = getStatusInfo(item.status);
    const daysLeftInfo = calculateDaysLeft(item.dueDate);
    
    return (
      <TouchableOpacity 
        style={styles.taskCard}
        onPress={() => {
          showCustomModal(
            '📋 Task Details',
            `Title: ${item.title}\nPrice: ${item.price}\nStatus: ${statusInfo.text}\nDue: ${item.dueDate}\n${isRequester ? `Expert: ${item.expertName || 'None assigned'}` : `Requester: ${item.requesterName}`}\n\nUrgency: ${item.urgency || 'Medium'}\nEstimated Hours: ${item.estimatedHours || 'N/A'}`,
            [{ text: 'Close', onPress: () => setShowModal(false) }]
          );
        }}
        activeOpacity={0.7}
      >
        {/* Task Header */}
        <View style={styles.taskHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.taskTitle}>📌 {item.title}</Text>
            <View style={styles.urgencyContainer}>
              {item.urgency && (
                <View style={[styles.urgencyBadge, getUrgencyStyle(item.urgency)]}>
                  <Text style={[styles.urgencyText, getUrgencyTextStyle(item.urgency)]}>
                    {getUrgencyIcon(item.urgency)} {item.urgency.toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.taskPrice}>{item.price}</Text>
        </View>
        
        {/* Due Date with countdown */}
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDateLabel}>📅 Due: {item.dueDate}</Text>
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

        {/* Progress bar for expert tasks */}
        {!isRequester && item.progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Progress</Text>
              <Text style={styles.progressValue}>{item.progress}%</Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.progress}%` }]} />
            </View>
          </View>
        )}

        {/* Person Info */}
        <Text style={styles.personInfo}>
          {isRequester 
            ? (item.expertName ? `👤 Expert: ${item.expertName}` : '👀 No expert assigned yet')
            : `👤 Requester: ${item.requesterName}`
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

        {/* Action Buttons */}
        {renderActionButtons(item, isRequester)}
      </TouchableOpacity>
    );
  };

  // Loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
          <Text style={styles.loadingSubtext}>Fetching latest data from server</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tasks 📂</Text>
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requester' && styles.activeTab]}
          onPress={() => handleTabChange('requester')}
        >
          <Text style={[styles.tabText, activeTab === 'requester' && styles.activeTabText]}>
            Requester ✅
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expert' && styles.activeTab]}
          onPress={() => handleTabChange('expert')}
        >
          <Text style={[styles.tabText, activeTab === 'expert' && styles.activeTabText]}>
            Expert 🎓
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Dashboard */}
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
          <Text style={[styles.statNumber, stats.overdue > 0 && styles.statWarning]}>
            {stats.overdue}
          </Text>
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

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadTasks()}>
            <Text style={styles.retryButtonText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2e7d32']}
            tintColor="#2e7d32"
          />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyTitle}>No tasks found</Text>
              <Text style={styles.emptyText}>
                {activeTab === 'requester' 
                  ? 'You haven\'t posted any tasks yet'
                  : 'You haven\'t accepted any tasks yet'
                }
              </Text>
            </View>
          )
        }
      />

      {/* Enhanced Custom Modal */}
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
            
            {actionLoading && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#2e7d32" />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              {modalData.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    button.style === 'cancel' && styles.modalButtonCancel,
                    button.style === 'destructive' && styles.modalButtonDestructive,
                    button.style === 'primary' && styles.modalButtonPrimary,
                    actionLoading && styles.modalButtonDisabled
                  ]}
                  onPress={button.onPress}
                  disabled={actionLoading}
                >
                  <Text style={[
                    styles.modalButtonText,
                    button.style === 'cancel' && styles.modalButtonTextCancel,
                    button.style === 'destructive' && styles.modalButtonTextDestructive,
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Placeholder Screen
const PlaceholderScreen = ({ name }) => (
  <View style={styles.placeholder}>
    <Text>{name}</Text>
  </View>
);

// Main App Component
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Post" component={PostScreen} />
        <Tab.Screen name="MyTasks" component={MyTasksScreen} />
        <Tab.Screen name="Notifications" children={() => <PlaceholderScreen name="Notifications" />} />
        <Tab.Screen name="Profile" children={() => <PlaceholderScreen name="Profile" />} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Complete Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111',
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#2e7d32',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
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
  statWarning: {
    color: '#f44336',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  instructionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 13,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#f44336',
    flex: 1,
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  taskList: {
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
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
  urgencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
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
  
  // Enhanced Modal Styles
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
  modalLoading: {
    alignItems: 'center',
    marginBottom: 16,
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
    backgroundColor: '#f0f0f0',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonPrimary: {
    backgroundColor: '#2e7d32',
  },
  modalButtonDestructive: {
    backgroundColor: '#f44336',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonTextCancel: {
    color: '#666',
  },
  modalButtonTextDestructive: {
    color: '#fff',
  },
});