import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';

const PostScreen = () => {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    price: '',
    deadline: '',
    description: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.subject.trim()) {
        Alert.alert('Error', 'Please select a subject');
        return;
      }
      if (!formData.title.trim()) {
        Alert.alert('Error', 'Please enter a task title');
        return;
      }
    }

    if (step === 2) {
      if (!formData.description.trim()) {
        Alert.alert('Error', 'Please enter a description');
        return;
      }
    }

    if (step === 3) {
      if (!formData.price.trim()) {
        Alert.alert('Error', 'Please enter a price');
        return;
      }
    }

    if (step < 5) {
      setStep(prev => prev + 1);
    } else {
      Alert.alert('Success', 'Task posted successfully!');
      setFormData({
        title: '',
        subject: '',
        price: '',
        deadline: '',
        description: '',
      });
      setStep(1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.header}>📌 Post Task (1/4)</Text>

            <Text style={styles.label}>📚 Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Select Subject"
              value={formData.subject}
              onChangeText={(text) => handleInputChange('subject', text)}
            />

            <Text style={styles.label}>📌 Task Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter a short clear title"
              value={formData.title}
              onChangeText={(text) => handleInputChange('title', text)}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.header}>📄 Post Task (2/4)</Text>

            <Text style={styles.label}>🖊️ Describe Your Task</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type or paste description"
              multiline
              numberOfLines={4}
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.header}>💰 Post Task (3/4)</Text>

            <Text style={styles.label}>💸 Price</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter price in USD"
              keyboardType="numeric"
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
            />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.header}>⏰ Post Task (4/4)</Text>

            <Text style={styles.label}>⏰ Deadline</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., May 25, 11:59 PM"
              value={formData.deadline}
              onChangeText={(text) => handleInputChange('deadline', text)}
            />
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.header}>✅ Review Task</Text>
            <Text>📚 Subject: {formData.subject}</Text>
            <Text>📌 Title: {formData.title}</Text>
            <Text>🖊️ Description: {formData.description}</Text>
            <Text>💰 Price: {formData.price}</Text>
            <Text>⏰ Deadline: {formData.deadline}</Text>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        {renderStep()}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity style={[styles.button, styles.back]} onPress={handleBack}>
              <Text style={styles.buttonText}>← Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{step === 5 ? 'Submit' : 'Next →'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f5f9', padding: 24 },
  form: { flex: 1 },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 8, color: '#333' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  back: {
    backgroundColor: '#ccc',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default PostScreen;
