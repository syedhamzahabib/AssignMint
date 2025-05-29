// src/services/AppStateManager.js
// Centralized app state management

import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import TaskService from './TaskService';
import WalletAPI from '../api/walletAPI';

class AppStateManager {
  constructor() {
    this.state = {
      // App State
      isInitialized: false,
      isLoading: false,
      
      // User State
      currentUser: null,
      userRole: 'requester', // 'requester' or 'expert'
      
      // UI State
      activeTab: 'home',
      showWallet: false,
      walletParams: {},
      unreadNotifications: 3,
      
      // Modal State
      modalState: {
        visible: false,
        title: '',
        message: '',
        buttons: [],
        loading: false,
      },
      
      // Tasks State
      tasks: [],
      taskStats: {
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
      },
      
      // Wallet State
      walletData: null,
      
      // Loading States
      tasksLoading: false,
      walletLoading: false,
      actionLoading: false,
    };
    
    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Update state and notify listeners
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current state
  getState() {
    return this.state;
  }

  // Initialize app
  async initialize() {
    try {
      this.setState({ isLoading: true });
      
      // Load initial data
      await Promise.all([
        this.loadTasks(),
        this.loadTaskStats(),
      ]);
      
      this.setState({ 
        isInitialized: true,
        isLoading: false 
      });
    } catch (error) {
      console.error('App initialization failed:', error);
      this.setState({ isLoading: false });
    }
  }

  // Load tasks
  async loadTasks() {
    try {
      this.setState({ tasksLoading: true });
      
      const response = await TaskService.getTasksByRole(this.state.userRole);
      if (response.success) {
        this.setState({ 
          tasks: response.data,
          tasksLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.setState({ tasksLoading: false });
      Alert.alert('Error', 'Failed to load tasks');
    }
  }

  // Load task statistics
  async loadTaskStats() {
    try {
      const response = await TaskService.getTaskStats(this.state.userRole);
      if (response.success) {
        this.setState({ taskStats: response.data });
      }
    } catch (error) {
      console.log('Failed to load task stats:', error);
    }
  }

  // Load wallet data
  async loadWalletData() {
    try {
      this.setState({ walletLoading: true });
      
      const response = await WalletAPI.getWalletData();
      if (response.success) {
        this.setState({ 
          walletData: response.data,
          walletLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      this.setState({ walletLoading: false });
    }
  }

  // Switch user role
  async switchRole(newRole) {
    if (newRole !== this.state.userRole) {
      this.setState({ userRole: newRole });
      await Promise.all([
        this.loadTasks(),
        this.loadTaskStats(),
      ]);
    }
  }

  // Handle tab change
  setActiveTab(tabName) {
    this.setState({ activeTab: tabName });
    
    // Load data based on active tab
    if (tabName === 'tasks' && this.state.tasks.length === 0) {
      this.loadTasks();
      this.loadTaskStats();
    }
  }

  // Handle wallet navigation
  openWallet(params = {}) {
    this.setState({ 
      showWallet: true, 
      walletParams: params 
    });
    
    // Load wallet data if not loaded
    if (!this.state.walletData) {
      this.loadWalletData();
    }
  }

  closeWallet() {
    this.setState({ 
      showWallet: false, 
      walletParams: {} 
    });
  }

  // Handle modal state
  showModal(config) {
    this.setState({
      modalState: {
        visible: true,
        title: config.title || '',
        message: config.message || '',
        buttons: config.buttons || [],
        loading: config.loading || false,
      }
    });
  }

  hideModal() {
    this.setState({
      modalState: { ...this.state.modalState, visible: false }
    });
  }

  setModalLoading(loading) {
    this.setState({
      modalState: { ...this.state.modalState, loading }
    });
  }

  // Handle task actions
  async submitTaskAction(taskId, action, data = {}) {
    try {
      this.setState({ actionLoading: true });
      
      const response = await TaskService.submitTaskAction(
        taskId, 
        action, 
        this.state.userRole, 
        data
      );
      
      if (response.success) {
        // Update local task state if new status provided
        if (response.data.newStatus) {
          const updatedTasks = this.state.tasks.map(task => 
            task.id === taskId 
              ? { ...task, status: response.data.newStatus }
              : task
          );
          this.setState({ tasks: updatedTasks });
        }
        
        // Refresh data
        await Promise.all([
          this.loadTasks(),
          this.loadTaskStats(),
        ]);
        
        return response;
      }
    } catch (error) {
      console.error(`Task action ${action} failed:`, error);
      throw error;
    } finally {
      this.setState({ actionLoading: false });
    }
  }

  // Refresh all data
  async refreshData() {
    await Promise.all([
      this.loadTasks(),
      this.loadTaskStats(),
      this.state.walletData ? this.loadWalletData() : Promise.resolve(),
    ]);
  }
}

// Create singleton instance
const appStateManager = new AppStateManager();

// React hook for using app state
export const useAppState = () => {
  const [state, setState] = useState(appStateManager.getState());

  useEffect(() => {
    const unsubscribe = appStateManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initialize: appStateManager.initialize.bind(appStateManager),
    loadTasks: appStateManager.loadTasks.bind(appStateManager),
    loadTaskStats: appStateManager.loadTaskStats.bind(appStateManager),
    loadWalletData: appStateManager.loadWalletData.bind(appStateManager),
    switchRole: appStateManager.switchRole.bind(appStateManager),
    setActiveTab: appStateManager.setActiveTab.bind(appStateManager),
    openWallet: appStateManager.openWallet.bind(appStateManager),
    closeWallet: appStateManager.closeWallet.bind(appStateManager),
    showModal: appStateManager.showModal.bind(appStateManager),
    hideModal: appStateManager.hideModal.bind(appStateManager),
    setModalLoading: appStateManager.setModalLoading.bind(appStateManager),
    submitTaskAction: appStateManager.submitTaskAction.bind(appStateManager),
    refreshData: appStateManager.refreshData.bind(appStateManager),
  };
};

export default appStateManager;