// services/AppStateManager.js - Fixed version
import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

// Mock API for tasks
const MockTasksAPI = {
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  async getTasksByRole(role) {
    await this.delay(500);
    
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
      },
    ];

    return {
      success: true,
      data: role === 'requester' ? requesterTasks : expertTasks,
    };
  },

  async getTaskStats(role) {
    await this.delay(200);
    
    const response = await this.getTasksByRole(role);
    const tasks = response.data;
    
    return {
      success: true,
      data: {
        total: tasks.length,
        active: tasks.filter(t => 
          ['in_progress', 'working', 'pending_review'].includes(t.status)
        ).length,
        completed: tasks.filter(t => 
          ['completed', 'payment_received'].includes(t.status)
        ).length,
        overdue: 0,
      }
    };
  }
};

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
      
      // Tasks State
      tasks: [],
      taskStats: {
        total: 0,
        active: 0,
        completed: 0,
        overdue: 0,
      },
      
      // Loading States
      tasksLoading: false,
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
      
      const response = await MockTasksAPI.getTasksByRole(this.state.userRole);
      if (response.success) {
        this.setState({ 
          tasks: response.data,
          tasksLoading: false 
        });
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.setState({ tasksLoading: false });
    }
  }

  // Load task statistics
  async loadTaskStats() {
    try {
      const response = await MockTasksAPI.getTaskStats(this.state.userRole);
      if (response.success) {
        this.setState({ taskStats: response.data });
      }
    } catch (error) {
      console.log('Failed to load task stats:', error);
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
  }

  closeWallet() {
    this.setState({ 
      showWallet: false, 
      walletParams: {} 
    });
  }

  // Refresh all data
  async refreshData() {
    await Promise.all([
      this.loadTasks(),
      this.loadTaskStats(),
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
    switchRole: appStateManager.switchRole.bind(appStateManager),
    setActiveTab: appStateManager.setActiveTab.bind(appStateManager),
    openWallet: appStateManager.openWallet.bind(appStateManager),
    closeWallet: appStateManager.closeWallet.bind(appStateManager),
    refreshData: appStateManager.refreshData.bind(appStateManager),
  };
};

export default appStateManager;