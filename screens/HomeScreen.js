import React from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import TaskCard from '../components/TaskCard';
import { dummyTasks } from '../data/dummyTasks';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>📋 Latest Tasks</Text>
      <FlatList
        data={dummyTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard {...item} />}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    color: '#111',
  },
  list: {
    paddingBottom: 16,
  },
});

export default HomeScreen;
