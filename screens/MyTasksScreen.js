// screens/MyTasksScreen.js - Updated to work with modular structure
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';

// Import modular components
import EnhancedTaskCard from '../src/components/task/EnhancedTaskCard';
import LoadingScreen, { TaskListSkeleton } from '../src/components/common/LoadingScreen';
import { useModal } from '../src/components/common/ModalManager';
import { useTasks } from '../src/hooks/useTasks';

// Import constants and utilities
import { COLORS, FONTS, SPACING } from '../src/constants';
import { getStatusInfo, calculateDaysLeft } from '../src/utils/taskHelpers';

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
  
  const {
    tasks,
    stats,
    loading,
    refreshing,
    actionLoading,
    onRefresh,
    submitTaskAction,
    isEmpty
  } = useTasks(userRole);

  const { showConfirm, ModalComponent } = useModal();

  const handleRoleChange = useCallback((newRole) => {
    if (newRole !== userRole) {
      setUserRole(newRole);
    }
  }, [userRole]);

  const handleTaskPress = useCallback((task) => {
    const statusInfo = getStatusInfo(task.status);
    Alert.alert(
      '📋 Task Details',
      `Task: ${task.title}\nPrice: ${task.price}\nStatus: ${statusInfo.text}\nDue: ${task.dueDate}`,
      [
        { text: 'Close', style: 'cancel' },
        { 
          text: 'View Details 👀', 
          onPress: () => Alert.alert('Details', 'Full task details would open here!') 
        }
      ]
    );
  }, []);

  const handleTaskAction = useCallback((action, task) => {
    const actionMessages = {
      review: `Approve task "${task.title}"?\n\nThis will release payment to the expert.`,
      dispute: `File dispute for "${task.title}"?\n\nOur team will review within 24 hours.`,
      cancel: `Cancel task "${task.title}"?\n\nThis action cannot be undone.`,
      upload: `Upload delivery for "${task.title}"?\n\nThe requester will be notified.`,
      edit: `Edit task "${task.title}"?\n\nYou can modify requirements and deadline.`,
    };

    showConfirm(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Task`,
      actionMessages[action] || `${action} for "${task.title}"`,
      () => executeTaskAction(action, task)
    );
  }, [showConfirm]);

  const executeTaskAction = useCallback(async (action, task) => {
    try {
      const response = await submitTaskAction(task.id, action);
      
      if (response.success) {
        Alert.alert('Success!', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Action failed. Please try again.');
    }
  }, [submitTaskAction]);

  const renderTaskCard = useCallback(({ item }) => (
    <EnhancedTaskCard
      task={item}
      onPress={handleTaskPress}
      onAction={handleTaskAction}
      isRequester={userRole === 'requester'}
      isLoading={actionLoading}
      showActions={true}
      compact={false}
    />
  ), [handleTaskPress, handleTaskAction, userRole, actionLoading]);

  const handleBackPress = () => {
    if (navigation && navigation.goBack) {
      navigation.goBack();
    }
  };

  // Show loading screen for initial load
  if (loading && tasks.length === 0) {
    return (
      <LoadingScreen 
        message="Loading your tasks..."
        submessage="Please wait while we fetch your latest tasks"
      />
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
        <View style={styles.headerRight} />
      </View>

      {/* Role Toggle */}
      <RoleToggle 
        activeRole={userRole} 
        onRoleChange={handleRoleChange} 
      />

      {/* Statistics */}
      <StatsCards stats={stats} />

      {/* Task Count & Instructions */}
      <View style={styles.taskCountContainer}>
        <Text style={styles.taskCount}>
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} found
        </Text>
        <Text style={styles.instructionText}>
          💡 Pull down to refresh • Tap cards for details • Tap buttons for actions!
        </Text>
      </View>

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <TaskListSkeleton count={3} />
      ) : isEmpty ? (
        <EmptyState role={userRole} />
      ) : (
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
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        />
      )}

      {/* Modal Component */}
      <ModalComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },
  backButton: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray900,
  },
  headerRight: {
    width: 50,
  },
  
  // Role Toggle Styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  roleTab: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeRoleTab: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: FONTS.sizes.md,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray600,
  },
  activeRoleTabText: {
    color: COLORS.white,
  },
  
  // Stats Styles
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.lg,
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    shadowColor: COLORS.black,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.extraBold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.gray600,
    fontWeight: FONTS.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  
  // Task Count & Instructions
  taskCountContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  taskCount: {
    fontSize: FONTS.sizes.md,
    color: COLORS.gray600,
    fontStyle: 'italic',
  },
  instructionText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    marginTop: SPACING.xs,
    fontWeight: FONTS.weights.medium,
  },
  
  // Task List
  taskList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.huge * 2,
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.gray700,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default MyTasksScreen;