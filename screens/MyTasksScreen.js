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

// Using your existing dummy data for now
const dummyRequesterTasks = [
  {
    id: 'req_1',
    title: 'Solve 10 Calculus Problems',
    dueDate: '2025-05-25',
    status: 'in_progress',
    expertName: 'Sarah Chen',
    subject: 'Math',
    price: '$20',
  },
  {
    id: 'req_2',
    title: 'Fix bugs in Python script',
    dueDate: '2025-05-22',
    status: 'pending_review',
    expertName: 'Alex Kumar',
    subject: 'Coding',
    price: '$30',
  },
  {
    id: 'req_3',
    title: 'Write 500-word essay on Civil War',
    dueDate: '2025-05-24',
    status: 'completed',
    expertName: 'Emily Rodriguez',
    subject: 'Writing',
    price: '$15',
  },
  {
    id: 'req_4',
    title: 'Design a logo for student group',
    dueDate: '2025-05-26',
    status: 'awaiting_expert',
    expertName: null,
    subject: 'Design',
    price: '$18',
  },
];

const dummyExpertTasks = [
  {
    id: 'exp_1',
    title: 'Translate English to Spanish document',
    dueDate: '2025-05-27',
    status: 'working',
    requesterName: 'John Smith',
    subject: 'Language',
    price: '$22',
  },
  {
    id: 'exp_2',
    title: 'Build basic website in HTML/CSS',
    dueDate: '2025-05-28',
    status: 'delivered',
    requesterName: 'Maria Garcia',
    subject: 'Coding',
    price: '$40',
  },
  {
    id: 'exp_3',
    title: 'Solve Statistics homework problems',
    dueDate: '2025-05-23',
    status: 'payment_received',
    requesterName: 'David Park',
    subject: 'Statistics',
    price: '$25',
  },
];

const MyTasksScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('requester');

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
      in_progress: { text: '🔄 In Progress', color: '#2196f3' },
      pending_review: { text: '⏳ Pending Review', color: '#ff9800' },
      completed: { text: '✅ Completed', color: '#4caf50' },
      awaiting_expert: { text: '👀 Finding Expert', color: '#9c27b0' },
      working: { text: '🔨 Working', color: '#2196f3' },
      delivered: { text: '📤 Delivered', color: '#ff9800' },
      payment_received: { text: '💰 Payment Received', color: '#4caf50' },
    };
    return statusMap[status] || { text: status, color: '#757575' };
  };

  // 🔥 WORKING ACTION HANDLERS - These will actually do something!
  const handleAction = (action, task) => {
    switch (action) {
      case 'review':
        Alert.alert(
          '✅ Review & Approve',
          `Review task: "${task.title}"\n\nWould you like to approve this task?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Approve ✅', 
              onPress: () => {
                Alert.alert('Success!', 'Task approved successfully! 🎉');
                // Here you would update the task status
              }
            }
          ]
        );
        break;
      case 'dispute':
        Alert.alert(
          '🚩 File Dispute',
          `Dispute task: "${task.title}"\n\nPlease provide a reason for the dispute.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'File Dispute 🚩', 
              style: 'destructive',
              onPress: () => {
                Alert.alert('Dispute Filed', 'Your dispute has been submitted for review.');
              }
            }
          ]
        );
        break;
      case 'cancel':
        Alert.alert(
          '❌ Cancel Task',
          `Cancel task: "${task.title}"\n\nThis action cannot be undone.`,
          [
            { text: 'Keep Task', style: 'cancel' },
            { 
              text: 'Cancel Task ❌', 
              style: 'destructive',
              onPress: () => {
                Alert.alert('Task Cancelled', 'Task has been cancelled successfully.');
              }
            }
          ]
        );
        break;
      case 'edit':
        Alert.alert(
          '🟨 Edit Task',
          `Edit task: "${task.title}"\n\nThis would open the edit screen.`,
          [
            { text: 'Close', style: 'cancel' },
            { 
              text: 'Edit Task 🟨', 
              onPress: () => {
                Alert.alert('Edit Mode', 'Task edit screen would open here!');
              }
            }
          ]
        );
        break;
      case 'upload':
        Alert.alert(
          '🟩 Upload Delivery',
          `Upload files for: "${task.title}"\n\nThis would open the file picker.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Upload Files 📁', 
              onPress: () => {
                Alert.alert('Files Uploaded', 'Your delivery has been uploaded! 📤');
              }
            }
          ]
        );
        break;
      case 'awaiting':
        Alert.alert('📤 Awaiting Approval', `Waiting for approval on: "${task.title}"`);
        break;
      case 'payment':
        Alert.alert('💰 Payment Received', `Payment details for: "${task.title}"`);
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

  // 🎯 CLICKABLE TASK CARD - Now with tap functionality!
  const renderTaskCard = ({ item }) => {
    const isRequester = activeTab === 'requester';
    const statusInfo = getStatusInfo(item.status);
    const daysLeft = calculateDaysLeft(item.dueDate);
    
    return (
      <TouchableOpacity 
        style={styles.taskCard}
        onPress={() => {
          Alert.alert(
            '📋 Task Details',
            `Task: ${item.title}\nPrice: ${item.price}\nStatus: ${statusInfo.text}\nDue: ${item.dueDate}`,
            [
              { text: 'Close', style: 'cancel' },
              { text: 'View Details 👀', onPress: () => Alert.alert('Details', 'Full task details would open here!') }
            ]
          );
        }}
        activeOpacity={0.7}
      >
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
            <Text style={styles.roleLabel}>
              {item.expertName ? `👤 Expert: ${item.expertName}` : '👀 No expert assigned yet'}
            </Text>
          ) : (
            <Text style={styles.roleLabel}>👤 Requester: {item.requesterName}</Text>
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
      </TouchableOpacity>
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
          style={[styles.tab, activeTab === 'requester' && styles.activeTab]}
          onPress={() => setActiveTab('requester')}
        >
          <Text style={[styles.tabText, activeTab === 'requester' && styles.activeTabText]}>
            Requester ✅
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'expert' && styles.activeTab]}
          onPress={() => setActiveTab('expert')}
        >
          <Text style={[styles.tabText, activeTab === 'expert' && styles.activeTabText]}>
            Expert 🎓
          </Text>
        </TouchableOpacity>
      </View>

      {/* Task Count */}
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>
          {currentTasks.length} task{currentTasks.length !== 1 ? 's' : ''} found
        </Text>
        <Text style={styles.instructionText}>💡 Tap any card for details, tap buttons for actions!</Text>
      </View>

      {/* Task List */}
      <FlatList
        data={currentTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTaskCard}
        contentContainerStyle={styles.taskList}
        showsVerticalScrollIndicator={false}
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
    color: '#2e7d32',
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
  instructionText: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
    fontWeight: '500',
  },
  taskList: {
    paddingBottom: 16,
  },
  taskCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    flex: 1,
    marginRight: 8,
  },
  taskPrice: {
    fontSize: 18,
    fontWeight: '800',
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
    marginLeft: 'auto',
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    minWidth: 120,
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
  awaitingBtn: { backgroundColor: '#2196f3' },
  paymentBtn: { backgroundColor: '#9c27b0' },
});

export default MyTasksScreen;