<<<<<<< HEAD
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';

const subjects = [
  { id: 'math', label: '📚 Math', value: 'Math' },
  { id: 'coding', label: '💻 Coding', value: 'Coding' },
  { id: 'writing', label: '✍️ Writing', value: 'Writing' },
  { id: 'design', label: '🎨 Design', value: 'Design' },
  { id: 'language', label: '🌍 Language', value: 'Language' },
  { id: 'science', label: '🔬 Science', value: 'Science' },
  { id: 'business', label: '💼 Business', value: 'Business' },
  { id: 'other', label: '📋 Other', value: 'Other' },
];

const StepOne = ({ formData, updateFormData, onNext, currentStep }) => {
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const selectSubject = (subject) => {
    updateFormData('subject', subject.value);
    setShowSubjectDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Empty space for first step */}
        </View>
        <Text style={styles.headerTitle}>Post Task (1/5)</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form Content */}
      <View style={styles.form}>
        {/* Subject Section */}
        <Text style={styles.label}>📚 Subject</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSubjectDropdown(true)}
        >
          <Text style={[
            styles.dropdownText,
            formData.subject ? styles.selectedText : styles.placeholderText
          ]}>
            {formData.subject || 'Select Subject'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Task Title Section */}
        <Text style={styles.label}>📌 Task Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a short clear title"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          maxLength={80}
        />
        <Text style={styles.charCount}>{formData.title.length}/80</Text>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Subject Dropdown Modal */}
      <Modal
        visible={showSubjectDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubjectDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectSubject(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#111',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    color: '#111',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default StepOne;
=======
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';

const subjects = [
  { id: 'math', label: '📚 Math', value: 'Math' },
  { id: 'coding', label: '💻 Coding', value: 'Coding' },
  { id: 'writing', label: '✍️ Writing', value: 'Writing' },
  { id: 'design', label: '🎨 Design', value: 'Design' },
  { id: 'language', label: '🌍 Language', value: 'Language' },
  { id: 'science', label: '🔬 Science', value: 'Science' },
  { id: 'business', label: '💼 Business', value: 'Business' },
  { id: 'other', label: '📋 Other', value: 'Other' },
];

const StepOne = ({ formData, updateFormData, onNext, currentStep }) => {
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  const selectSubject = (subject) => {
    updateFormData('subject', subject.value);
    setShowSubjectDropdown(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Empty space for first step */}
        </View>
        <Text style={styles.headerTitle}>Post Task (1/4)</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form Content */}
      <View style={styles.form}>
        {/* Subject Section */}
        <Text style={styles.label}>📚 Subject</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowSubjectDropdown(true)}
        >
          <Text style={[
            styles.dropdownText,
            formData.subject ? styles.selectedText : styles.placeholderText
          ]}>
            {formData.subject || 'Select Subject'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {/* Task Title Section */}
        <Text style={styles.label}>📌 Task Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a short clear title"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => updateFormData('title', text)}
          maxLength={80}
        />
        <Text style={styles.charCount}>{formData.title.length}/80</Text>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>

      {/* Subject Dropdown Modal */}
      <Modal
        visible={showSubjectDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubjectDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubjectDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            <FlatList
              data={subjects}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => selectSubject(item)}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
  },
  form: {
    flex: 1,
    paddingTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#111',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    color: '#111',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    marginBottom: 24,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    color: '#111',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default StepOne;
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
