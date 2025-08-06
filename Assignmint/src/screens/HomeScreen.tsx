import React from 'react';
import { View, Text } from 'react-native';

const HomeScreen = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
      <Text style={{ fontSize: 20, color: 'black' }}>Hello World!</Text>
      <Text style={{ fontSize: 16, color: 'gray', marginTop: 10 }}>Home Screen Working</Text>
    </View>
  );
};

export default HomeScreen;