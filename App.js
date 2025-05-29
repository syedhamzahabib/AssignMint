// App.js - Fixed version
import React, { useEffect } from 'react';
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

  // Navigation helper for legacy screens
  const navigation = {
    navigate: (screenName, params = {}) => {
      console.log(`🧭 Navigating to: ${screenName}`, params);
      if (screenName === 'Wallet') {
        openWallet(params);
      }
    },
    goBack: () => {
      if (showWallet) {
        closeWallet();
      } else {
        console.log('🧭 Going back');
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

    // Render main screens
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
  };

  const renderHeader = () => {
    if (showWallet) {
      return null; // WalletScreen handles its own header
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

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        {renderHeader()}

        {/* Main Content - FIXED: Changed from <div> to <View> */}
        <View style={styles.content}>
          {renderCurrentScreen()}
        </View>

        {/* Bottom Tab Bar */}
        <TabBar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          unreadNotifications={unreadNotifications}
          showWallet={showWallet}
        />

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