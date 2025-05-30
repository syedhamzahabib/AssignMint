// App.js - Updated with proper navigation stack
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

// Import components with correct paths
import AppHeader, { HomeHeader } from './components/common/AppHeader';
import TabBar from './components/common/TabBar';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useAppState } from './services/AppStateManager';
import { useModal } from './components/common/ModalManager';

// Import screens with correct paths
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';
import MyTasksScreen from './screens/MyTasksScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import ProfileScreen from './screens/ProfileScreen';
import WalletScreen from './screens/WalletScreen';
import TaskDetailsScreen from './screens/TaskDetailsScreen';
import UploadDeliveryScreen from './screens/UploadDeliveryScreen';

// Import constants
import { COLORS, SCREEN_NAMES } from './constants';

const App = () => {
  const {
    // State
    activeTab,
    showWallet,
    walletParams,
    unreadNotifications,
    isInitialized,
    isLoading,
    
    // Actions
    initialize,
    setActiveTab,
    openWallet,
    closeWallet,
  } = useAppState();

  const { ModalComponent } = useModal();
  
  // Navigation stack state
  const [navigationStack, setNavigationStack] = useState([{ name: 'Home', params: {} }]);
  
  // Get current screen from navigation stack
  const currentScreen = navigationStack[navigationStack.length - 1];

  // Navigation helper
  const navigation = {
    navigate: (screenName, params = {}) => {
      console.log(`🧭 Navigating to: ${screenName}`, params);
      
      if (screenName === 'Wallet') {
        openWallet(params);
        return;
      }
      
      // Add to navigation stack
      setNavigationStack(prev => [...prev, { name: screenName, params }]);
    },
    
    goBack: () => {
      if (showWallet) {
        closeWallet();
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
  };

  // Initialize app on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  const handleTabPress = (tabId) => {
    // Reset navigation stack when switching tabs
    setNavigationStack([{ name: 'Home', params: {} }]);
    setActiveTab(tabId);
  };

  const handleProfilePress = () => {
    setActiveTab('profile');
  };

  const renderCurrentScreen = () => {
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
          case SCREEN_NAMES.HOME:
          case 'home':
            return <HomeScreen navigation={navigation} />;
            
          case SCREEN_NAMES.POST_TASK:
          case 'post':
            return <PostScreen navigation={navigation} />;
            
          case SCREEN_NAMES.MY_TASKS:
          case 'tasks':
            return <MyTasksScreen navigation={navigation} />;
            
          case SCREEN_NAMES.NOTIFICATIONS:
          case 'notifications':
            return <NotificationsScreen navigation={navigation} />;
            
          case SCREEN_NAMES.PROFILE:
          case 'profile':
            return <ProfileScreen navigation={navigation} />;
            
          default:
            return <HomeScreen navigation={navigation} />;
        }
    }
  };

  const renderHeader = () => {
    if (showWallet || currentScreen.name !== 'Home') {
      return null; // Screens handle their own headers
    }

    switch (activeTab) {
      case 'home':
        return <HomeHeader onProfilePress={handleProfilePress} />;
      default:
        return (
          <AppHeader 
            title="AssignMint"
            subtitle="Assignment Help Marketplace"
          />
        );
    }
  };

  const shouldShowTabBar = () => {
    // Hide tab bar for certain screens
    const hideTabBarScreens = ['TaskDetails', 'UploadDelivery'];
    return !showWallet && !hideTabBarScreens.includes(currentScreen.name);
  };

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
            showWallet={showWallet}
          />
        )}

        {/* Global Modal */}
        <ModalComponent />
      </SafeAreaView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});

export default App;