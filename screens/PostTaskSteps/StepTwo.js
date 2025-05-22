import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';

const StepTwo = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const handleAddImages = () => {
    // Simulate image picker
    Alert.alert('Image Picker', 'Image picker would open here in a real app');
  };

  const handleAddFiles = () => {
    // Simulate file picker
    Alert.alert('File Picker', 'File picker would open here in a real app');
  };

  const removeFile = (index, type) => {
    const files = [...formData[type]];
    files.splice(index, 1);
    updateFormData(type, files);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Task (2/4)</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description Section */}
        <Text style={styles.label}>🖊️ Describe Your Task</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Type or paste description..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={6}
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
          <Text style={styles.uploadSubtext}>JPG, PNG up to 10MB each</Text>
        </TouchableOpacity>

        {/* Display selected images */}
        {formData.images.length > 0 && (
          <View style={styles.fileList}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileName}>🖼️ {image.name}</Text>
                <TouchableOpacity
                  onPress={() => removeFile(index, 'images')}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Files Section */}
        <Text style={styles.label}>📎 Upload Files (Optional)</Text>
        <View style={styles.fileUploadContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleAddFiles}>
            <Text style={styles.uploadIcon}>📄</Text>
            <Text style={styles.uploadText}>Upload Files</Text>
            <Text style={styles.uploadSubtext}>PDF, DOCX, TXT up to 25MB</Text>
          </TouchableOpacity>
        </View>

        {/* Display selected files */}
        {formData.files.length > 0 && (
          <View style={styles.fileList}>
            {formData.files.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileName}>📄 {file.name}</Text>
                <TouchableOpacity
                  onPress={() => removeFile(index, 'files')}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.spacer} />
      </ScrollView>

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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
  },
  backButton: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    paddingTop: 32,
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
    minHeight: 120,
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
  uploadButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#666',
  },
  fileUploadContainer: {
    marginBottom: 24,
  },
  fileList: {
    marginBottom: 24,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#ff4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
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
