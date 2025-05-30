// App.js - Complete fixed version with all necessary imports
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity 
} from 'react-native';

// Import screens - Make sure these files exist and have default exports
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import MyTasksScreen from './screens/MyTasksScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import WalletScreen from './screens/WalletScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import UploadDeliveryScreen from './screens/UploadDeliveryScreen';

// Import the fixed AppStateManager
import { useAppState } from './services/AppStateManager';

// Constants
const COLORS = {
  background: '#f4f5f9',
  primary: '#2e7d32',
  white: '#ffffff',
  gray600: '#666',
  gray800: '#333',
};

// Simple Header Component
const AppHeader = ({ title = "AssignMint", subtitle, onProfilePress, showProfile = false }) => (
  <View style={headerStyles.container}>
    <View style={headerStyles.titleContainer}>
      <Text style={headerStyles.title}>{title}</Text>
      {subtitle && <Text style={headerStyles.subtitle}>{subtitle}</Text>}
    </View>
    {showProfile && onProfilePress && (
      <TouchableOpacity onPress={onProfilePress} style={headerStyles.profileButton}>
        <Text style={headerStyles.profileIcon}>👤</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Simple Tab Bar Component
const TabBar = ({ activeTab, onTabPress, unreadNotifications = 0 }) => {
  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'post', icon: '➕', label: 'Post' },
    { id: 'tasks', icon: '📋', label: 'My Tasks' },
    { id: 'notifications', icon: '🔔', label: 'Notifications', badgeCount: unreadNotifications },
    { id: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <View style={tabBarStyles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[tabBarStyles.tab, activeTab === tab.id && tabBarStyles.activeTab]}
          onPress={() => onTabPress(tab.id)}
        >
          <View style={tabBarStyles.iconContainer}>
            <Text style={[tabBarStyles.icon, activeTab === tab.id && tabBarStyles.activeIcon]}>
              {tab.icon}
            </Text>
            {tab.badgeCount > 0 && (
              <View style={tabBarStyles.badge}>
                <Text style={tabBarStyles.badgeText}>{tab.badgeCount}</Text>
              </View>
            )}
          </View>
          <Text style={[tabBarStyles.label, activeTab === tab.id && tabBarStyles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.icon}>😵</Text>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'Please restart the app'}
          </Text>
          <TouchableOpacity 
            style={errorStyles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Simple Modal Hook
const useModal = () => {
  return {
    ModalComponent: () => null, // Placeholder - add your modal component here if needed
  };
};

// Main App Component
const App = () => {
  const {
    // State with fallback values
    activeTab = 'home',
    showWallet = false,
    walletParams = {},
    unreadNotifications = 3,
    isInitialized = false,
    isLoading = false,
    
    // Actions (these might be undefined if AppStateManager isn't working)
    initialize,
    setActiveTab,
    openWallet,
    closeWallet,
  } = useAppState() || {}; // Add fallback for undefined useAppState

  const { ModalComponent } = useModal();
  
  // Navigation stack state
  const [navigationStack, setNavigationStack] = useState([{ name: 'Home', params: {} }]);
  
  // Get current screen from navigation stack
  const currentScreen = navigationStack[navigationStack.length - 1] || { name: 'Home', params: {} };

  // Initialize app on mount
  useEffect(() => {
    if (!isInitialized && !isLoading && initialize) {
      initialize().catch(error => {
        console.error('Failed to initialize app:', error);
      });
    }
  }, [isInitialized, isLoading, initialize]);

  // Memoized navigation object
  const navigation = useMemo(() => ({
    navigate: (screenName, params = {}) => {
      console.log(`🧭 Navigating to: ${screenName}`, params);
      
      if (screenName === 'Wallet') {
        openWallet && openWallet(params);
        return;
      }
      
      setNavigationStack(prev => [...prev, { name: screenName, params }]);
    },
    
    goBack: () => {
      if (showWallet) {
        closeWallet && closeWallet();
        return;
      }
      
      if (navigationStack.length > 1) {
        setNavigationStack(prev => prev.slice(0, -1));
        console.log('🧭 Going back');
      }
    },
    
    reset: (routes) => {
      if (routes && routes.routes) {
        setNavigationStack(routes.routes);
      } else {
        setNavigationStack([{ name: 'Home', params: {} }]);
      }
    }
  }), [showWallet, closeWallet, openWallet, navigationStack.length]);

  // Tab press handler
  const handleTabPress = useCallback((tabId) => {
    setNavigationStack([{ name: 'Home', params: {} }]);
    setActiveTab && setActiveTab(tabId);
  }, [setActiveTab]);

  // Profile press handler
  const handleProfilePress = useCallback(() => {
    setActiveTab && setActiveTab('profile');
  }, [setActiveTab]);

  // Screen renderer with error handling
  const renderCurrentScreen = useCallback(() => {
    try {
      // Handle wallet screen overlay
      if (showWallet) {
        return (
          <WalletScreen 
            navigation={navigation} 
            route={{ params: walletParams }} 
          />
        );
      }

      // Handle navigation stack screens
      switch (currentScreen.name) {
        case 'TaskDetails':
          return (
            <TaskDetailsScreen 
              navigation={navigation} 
              route={{ params: currentScreen.params }} 
            />
          );
          
        case 'UploadDelivery':
          return (
            <UploadDeliveryScreen 
              navigation={navigation} 
              route={{ params: currentScreen.params }} 
            />
          );
          
        default:
          // Render main tab screens
          switch (activeTab) {
            case 'home':
              return <HomeScreen navigation={navigation} />;
            case 'post':
              return <PostScreen navigation={navigation} />;
            case 'tasks':
              return <MyTasksScreen navigation={navigation} />;
            case 'notifications':
              return <NotificationsScreen navigation={navigation} />;
            case 'profile':
              return <ProfileScreen navigation={navigation} />;
            default:
              return <HomeScreen navigation={navigation} />;
          }
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <View style={styles.errorFallback}>
          <Text style={styles.errorText}>Screen failed to load</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => setNavigationStack([{ name: 'Home', params: {} }])}
          >
            <Text style={styles.errorButtonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      );
    }
  }, [showWallet, walletParams, currentScreen, activeTab, navigation]);

  // Header renderer
  const renderHeader = useCallback(() => {
    if (showWallet || currentScreen.name !== 'Home') {
      return null; // Screens handle their own headers
    }

    switch (activeTab) {
      case 'home':
        return (
          <AppHeader 
            title="Welcome Back! 👋"
            subtitle="Find help with your assignments"
            showProfile={true}
            onProfilePress={handleProfilePress}
          />
        );
      default:
        return (
          <AppHeader 
            title="AssignMint"
            subtitle="Assignment Help Marketplace"
          />
        );
    }
  }, [showWallet, currentScreen.name, activeTab, handleProfilePress]);

  // Tab bar visibility
  const shouldShowTabBar = useCallback(() => {
    const hideTabBarScreens = ['TaskDetails', 'UploadDelivery'];
    return !showWallet && !hideTabBarScreens.includes(currentScreen.name);
  }, [showWallet, currentScreen.name]);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        {renderHeader()}

        {/* Main Content */}
        <View style={styles.content}>
          {renderCurrentScreen()}
        </View>

        {/* Bottom Tab Bar */}
        {shouldShowTabBar() && (
          <TabBar
            activeTab={activeTab}
            onTabPress={handleTabPress}
            unreadNotifications={unreadNotifications}
          />
        )}

        {/* Global Modal */}
        <ModalComponent />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  errorFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.gray800,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  profileIcon: {
    fontSize: 20,
  },
});

const tabBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling can be added here
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    fontSize: 24,
    color: '#666',
  },
  activeIcon: {
    color: COLORS.primary,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
 
export default App;