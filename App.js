import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import HomeScreen from './screens/HomeScreen';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ name }) => (
  <View style={styles.center}>
    <Text>{name}</Text>
  </View>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Post" children={() => <PlaceholderScreen name="Post" />} />
        <Tab.Screen name="MyTasks" children={() => <PlaceholderScreen name="My Tasks" />} />
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
