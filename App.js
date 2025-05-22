import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import PostScreen from './screens/PostScreen';

// Try to import MyTasksScreen - if this fails, we'll see an error
import MyTasksScreen from './screens/MyTasksScreen';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }) => (
  <View style={styles.center}>
    <Text>{name}</Text>
  </View>
);

export default function App() {
  console.log('App is loading...'); // Add this to see if App loads
  
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Post" component={PostScreen} />
        <Tab.Screen name="MyTasks" component={MyTasksScreen} />
        <Tab.Screen name="Notifications" children={() => <PlaceholderScreen name="Notifications" />} />
        <Tab.Screen name="Profile" children={() => <PlaceholderScreen name="Profile" />} />
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