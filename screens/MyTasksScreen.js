import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
} from 'react-native';
import { dummyRequesterTasks, dummyExpertTasks } from '../data/dummyMyTasks';

const MyTasksScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('requester'); // 'requester' or 'expert'

  // Calculate days left until due date
  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  // Get status display text and color
  const getStatusInfo = (status) => {
    const statusMap = {
      // Requester statuses
      in_progress: { text: '🔄 In Progress', color: '#2196f3' },
      pending_review: { text: '⏳ Pending Review', color: '#ff9800' },
      completed: { text: '✅ Completed', color: '#4caf50' },
      awaiting_expert: { text: '👀 Finding Expert', color: '#9c27b0' },
      disputed: { text: '⚠️ Disputed', color: '#f44336' },
      cancelled: { text: '❌ Cancelled', color: '#757575' },
      
      // Expert statuses
      working: { text: '🔨 Working', color: '#2196f3' },
      delivered: { text: '📤 Delivered', color: '#ff9800' },
      payment_received: { text: '💰 Payment Received', color: '#4caf50' },
      revision_requested: { text: '🔄 Revision Requested', color: '#ff5722' },
    };
    
    return statusMap[status] || { text: status, color: '#757575' };
  };

  // Handle action buttons
  const handleAction = (action, task) => {
    switch (action) {
      case 'review':
        Alert.alert('Review & Approve', `Review task: ${task.title}`);
        break;
      case 'dispute':
        Alert.alert('Dispute Task', `Dispute task: ${task.title}`);
        break;
      case 'cancel':
        Alert.alert('Cancel Task', `Cancel task: ${task.title}`);
        break;
      case 'edit':
        Alert.alert('Edit Task', `Edit task: ${task.title}`);
        break;
      case 'upload':
        Alert.alert('Upload Delivery', `Upload files for: ${task.title}`);
        break;
      case 'awaiting':
        Alert.alert('Awaiting Approval', `Waiting for approval: ${task.title}`);
        break;
      case 'payment':
        Alert.alert('Payment Info', `Payment details for: ${task.title}`);
        break;
      default:
        Alert.alert('Action', `${action} for ${task.title}`);
    }
  };

  // Render action buttons based on role and status
  const renderActionButtons = (task, isRequester) => {
    if (isRequester) {
      switch (task.status) {
        case 'pending_review':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => handleAction('review', task)}
              >
                <Text style={styles.actionBtnText}>✅ Review & Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.disputeBtn]}
                onPress={() => handleAction('dispute', task)}
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
              >
                <Text style={styles.actionBtnText}>🟨 View/Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.cancelBtn]}
                onPress={() => handleAction('cancel', task)}
              >
                <Text style={styles.actionBtnText}>❌ Cancel</Text>
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
              >
                <Text style={styles.actionBtnText}>🟩 Upload Delivery</Text>
              </TouchableOpacity>
            </View>
          );
        case 'delivered':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.awaitingBtn]}
                onPress={() => handleAction('awaiting', task)}
              >
                <Text style={styles.actionBtnText}>📤 Awaiting Approval</Text>
              </TouchableOpacity>
            </View>
          );
        case 'payment_received':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.paymentBtn]}
                onPress={() => handleAction('payment', task)}
              >
                <Text style={styles.actionBtnText}>💰 Payment Received</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    }
  };

  // Render individual task card
  const renderTaskCard = ({ item }) => {
    const isRequester = activeTab === 'requester';
    const statusInfo = getStatusInfo(item.status);
    const daysLeft = calculateDaysLeft(item.dueDate);
    
    return (
      <View style={styles.taskCard}>
        {/* Task Header */}
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>📌 {item.title}</Text>
          <Text style={styles.taskPrice}>{item.price}</Text>
        </View>
        
        {/* Due Date */}
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueDateLabel}>📅 Due:</Text>
          <Text style={styles.dueDateText}>{item.dueDate}</Text>
          <Text style={[
            styles.daysLeft,
            daysLeft.includes('overdue') && styles.overdue
          ]}>
            {daysLeft}
          </Text>
        </View>

        {/* Role-specific info */}
        <View style={styles.roleInfo}>
          {isRequester ? (
            <View style={styles.expertInfo}>
              <Text style={styles.roleLabel}>
                {item.expertName ? `👤 Expert: ${item.expertName}` : '👀 No expert assigned yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.requesterInfo}>
              <Text style={styles.roleLabel}>👤 Requester: {item.requesterName}</Text>
            </View>
          )}
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        {/* Action Buttons */}
        {renderActionButtons(item, isRequester)}
      </View>
    );
  };

  const currentTasks = activeTab === 'requester' ? dummyRequesterTasks : dummyExpertTasks;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks 📂</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'requester' && styles.activeTab
          ]}
          onPress={() => setActiveTab('requester')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'requester' && styles.activeTabText
          ]}>
            Requester ✅
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'expert' && styles.activeTab
          ]}
          onPress={() => setActiveTab('expert')}
        >
          <Text style={[
            styles.tabText,
            activeTab === 'expert' && styles.activeTabText
          ]}>
            Expert 🎓
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Count */}
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>
          {currentTasks.length} task{currentTasks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Task List */}
      <FlatList
        data={currentTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
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
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerRight: {
    width: 50,
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
  taskCountContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  taskList: {
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 8,
  },
  taskPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDateLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  dueDateText: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    marginRight: 8,
  },
  daysLeft: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  overdue: {
    color: '#f44336',
    backgroundColor: '#ffebee',
  },
  roleInfo: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 100,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#fff',
  },
  approveBtn: {
    backgroundColor: '#4caf50',
  },
  disputeBtn: {
    backgroundColor: '#ff5722',
  },
  cancelBtn: {
    backgroundColor: '#f44336',
  },
  editBtn: {
    backgroundColor: '#ff9800',
  },
  uploadBtn: {
    backgroundColor: '#4caf50',
  },
  awaitingBtn: {
    backgroundColor: '#2196f3',
  },
  paymentBtn: {
    backgroundColor: '#9c27b0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MyTasksScreen;