// screens/MyTasksScreen.js - Updated with UploadDelivery navigation
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

// Import existing components
import TaskCard from '../components/TaskCard';
import FilterModal from '../components/FilterModal';

// Import APIs
import { TasksAPI } from '../api/tasks';

// Mock data fallback
const mockRequesterTasks = [
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
];

const mockExpertTasks = [
  {
    id: 'exp_1',
    title: 'Translate English to Spanish document',
    dueDate: '2025-05-27',
    status: 'working',
    requesterName: 'John Smith',
    subject: 'Language',
    price: '$22',
    progress: 45,
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
  },
];

const RoleToggle = ({ activeRole, onRoleChange }) => (
  <View style={styles.tabContainer}>
    <TouchableOpacity
      style={[styles.roleTab, activeRole === 'requester' && styles.activeRoleTab]}
      onPress={() => onRoleChange('requester')}
    >
      <Text style={[styles.roleTabText, activeRole === 'requester' && styles.activeRoleTabText]}>
        Requester ✅
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[styles.roleTab, activeRole === 'expert' && styles.activeRoleTab]}
      onPress={() => onRoleChange('expert')}
    >
      <Text style={[styles.roleTabText, activeRole === 'expert' && styles.activeRoleTabText]}>
        Expert 🎓
      </Text>
    </TouchableOpacity>
  </View>
);

const StatsCards = ({ stats }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{stats.active || 0}</Text>
      <Text style={styles.statLabel}>Active</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{stats.completed || 0}</Text>
      <Text style={styles.statLabel}>Completed</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{stats.overdue || 0}</Text>
      <Text style={styles.statLabel}>Overdue</Text>
    </View>
    <View style={styles.statCard}>
      <Text style={styles.statNumber}>{stats.total || 0}</Text>
      <Text style={styles.statLabel}>Total</Text>
    </View>
  </View>
);

const EmptyState = ({ role }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>📭</Text>
    <Text style={styles.emptyTitle}>No tasks found</Text>
    <Text style={styles.emptyText}>
      {role === 'requester' 
        ? "You haven't posted any tasks yet"
        : "You haven't accepted any tasks yet"
      }
    </Text>
  </View>
);

const MyTasksScreen = ({ navigation }) => {
  const [userRole, setUserRole] = useState('requester');
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    overdue: 0
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    sortBy: 'due_date_asc',
    urgency: 'all',
    search: ''
  });

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      
      // Try to use the API, fallback to mock data
      let tasksData;
      try {
        const response = await TasksAPI.getTasksByRole(userRole);
        tasksData = response.success ? response.data : [];
      } catch (error) {
        console.log('API failed, using mock data:', error);
        tasksData = userRole === 'requester' ? mockRequesterTasks : mockExpertTasks;
      }
      
      setTasks(tasksData);
      
      // Calculate stats
      const newStats = {
        total: tasksData.length,
        active: tasksData.filter(t => 
          ['in_progress', 'working', 'pending_review', 'awaiting_expert'].includes(t.status)
        ).length,
        completed: tasksData.filter(t => 
          ['completed', 'payment_received'].includes(t.status)
        ).length,
        overdue: tasksData.filter(t => {
          const due = new Date(t.dueDate);
          const now = new Date();
          return due < now && !['completed', 'payment_received', 'cancelled'].includes(t.status);
        }).length,
      };
      
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      Alert.alert('Error', 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const handleRoleChange = useCallback((newRole) => {
    if (newRole !== userRole) {
      setUserRole(newRole);
    }
  }, [userRole]);

  const handleTaskPress = useCallback((task) => {
    // Navigate to TaskDetailsScreen with the task data
    navigation.navigate('TaskDetails', {
      taskId: task.id,
      role: userRole,
      task: task
    });
  }, [navigation, userRole]);

  // UPDATED: Enhanced task action handler with Upload Delivery option
  const handleTaskAction = useCallback((task) => {
    const actions = [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: '👀 View Details', 
        onPress: () => handleTaskPress(task) 
      }
    ];

    // Add role-specific actions
    if (userRole === 'expert') {
      // Expert-specific actions
      if (task.status === 'working') {
        actions.splice(1, 0, {
          text: '📤 Upload Delivery',
          onPress: () => navigation.navigate('UploadDelivery', { task })
        });
      } else if (task.status === 'revision_requested') {
        actions.splice(1, 0, {
          text: '🔄 Submit Revision',
          onPress: () => navigation.navigate('UploadDelivery', { task })
        });
      }
    } else {
      // Requester-specific actions
      if (task.status === 'pending_review') {
        actions.splice(1, 0, {
          text: '✅ Review & Approve',
          onPress: () => Alert.alert('Review Task', `Review functionality for "${task.title}" would open here!`)
        });
        actions.splice(2, 0, {
          text: '🚩 Dispute',
          onPress: () => Alert.alert('Dispute Task', `Dispute functionality for "${task.title}" would open here!`)
        });
      } else if (task.status === 'awaiting_expert') {
        actions.splice(1, 0, {
          text: '✏️ Edit Task',
          onPress: () => Alert.alert('Edit Task', `Edit functionality for "${task.title}" coming soon!`)
        });
      }
    }

    Alert.alert(
      `🎯 ${task.title}`,
      `Status: ${task.status}\nPrice: ${task.price}\nDue: ${task.dueDate}\n\nSelect an action:`,
      actions
    );
  }, [handleTaskPress, navigation, userRole]);

  const handleApplyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  const filteredTasks = React.useMemo(() => {
    let filtered = [...tasks];
    
    // Apply filters here if needed
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    
    if (filters.search.trim()) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [tasks, filters]);

  const renderTaskCard = useCallback(({ item }) => (
    <TaskCard
      task={item}
      onPress={handleTaskPress}
      onActionPress={handleTaskAction}
      isRequester={userRole === 'requester'}
    />
  ), [handleTaskPress, handleTaskAction, userRole]);

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Load tasks when component mounts or role changes
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Show loading screen for initial load
  if (loading && tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading your tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Tasks 📂</Text>
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Text style={styles.filterButton}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Role Toggle */}
      <RoleToggle 
        activeRole={userRole} 
        onRoleChange={handleRoleChange} 
      />

      {/* Statistics */}
      <StatsCards stats={stats} />

      {/* Task Count */}
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
        </Text>
        <Text style={styles.instructionText}>
          💡 Pull down to refresh • Tap cards for actions
        </Text>
      </View>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState role={userRole} />
      ) : (
        <FlatList
          data={filteredTasks}
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
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
        isRequester={userRole === 'requester'}
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
  filterButton: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
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
  
  // Role Toggle Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
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
    marginHorizontal: 16,
    marginTop: 16,
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
    shadowRadius: 4,
    elevation: 2,
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
    textAlign: 'center',
  },
  
  // Task Count & Instructions
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
  
  // Task List
  taskList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default MyTasksScreen;