import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Assign color based on subject
const getTagColor = (subject) => {
  switch (subject.toLowerCase()) {
    case 'math': return '#3f51b5';
    case 'coding': return '#00796b';
    case 'writing': return '#d84315';
    case 'design': return '#6a1b9a';
    case 'language': return '#00838f';
    default: return '#9e9e9e';
  }
};

const TaskCard = ({ title, subject, price, deadline }) => (
  <View style={styles.card}>
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <View style={[styles.tag, { backgroundColor: getTagColor(subject) }]}>
        <Text style={styles.tagText}>{subject}</Text>
      </View>
    </View>
    <Text style={styles.meta}>Deadline: {deadline}</Text>
    <Text style={styles.price}>{price}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    flexShrink: 1,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  tag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default TaskCard;
