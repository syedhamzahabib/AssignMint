import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const StepTwo = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const handleAddImages = () => {
    Alert.alert('Image Picker', 'Image picker would open here in a real app');
  };

  const handleAddFiles = () => {
    Alert.alert('File Picker', 'File picker would open here in a real app');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Task (2/5)</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form Content - No ScrollView */}
      <View style={styles.form}>
        {/* Description Section */}
        <Text style={styles.label}>🖊️ Describe Your Task</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Type or paste description..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={formData.description}
          onChangeText={(text) => updateFormData('description', text)}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{formData.description.length}/1000</Text>

        {/* Images Section */}
        <Text style={styles.label}>🖼️ Add Images (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleAddImages}>
          <Text style={styles.uploadIcon}>📷</Text>
          <Text style={styles.uploadText}>Add Images</Text>
        </TouchableOpacity>

        {/* Files Section */}
        <Text style={styles.label}>📎 Upload Files (Optional)</Text>
        <TouchableOpacity style={styles.uploadButton} onPress={handleAddFiles}>
          <Text style={styles.uploadIcon}>📄</Text>
          <Text style={styles.uploadText}>Upload Files</Text>
        </TouchableOpacity>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerRight: { flex: 1 },
  backButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  form: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    color: '#111',
    marginBottom: 8,
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginBottom: 24,
  },
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  uploadIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
});

export default StepTwo;
