import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';

const Tab = createBottomTabNavigator();

const HomeScreen = () => <View style={styles.center}><Text>Home</Text></View>;
const PostScreen = () => <View style={styles.center}><Text>Post</Text></View>;
const MyTasksScreen = () => <View style={styles.center}><Text>My Tasks</Text></View>;
const NotificationsScreen = () => <View style={styles.center}><Text>Notifications</Text></View>;
const ProfileScreen = () => <View style={styles.center}><Text>Profile</Text></View>;

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Post" component={PostScreen} />
        <Tab.Screen name="MyTasks" component={MyTasksScreen} />
        <Tab.Screen name="Notifications" component={NotificationsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = {
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
};
