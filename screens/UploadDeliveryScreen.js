// screens/UploadDeliveryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { TasksAPI } from '../api/tasks';
import { getSubjectColor, formatDate, calculateDaysLeft } from '../utils/taskHelpers';

const UploadDeliveryScreen = ({ route, navigation }) => {
  const { task } = route.params || {};
  
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  // Safety check for task
  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>No Task Found</Text>
          <Text style={styles.errorText}>Unable to load task information.</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const daysLeftInfo = calculateDaysLeft(task.dueDate);
  const subjectColor = getSubjectColor(task.subject);

  // Mock file picker function
  const handleFilePicker = () => {
    Alert.alert(
      '📁 Select Files',
      'Choose how you want to add files to your delivery:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📄 Documents', 
          onPress: () => addMockFiles('document')
        },
        { 
          text: '💻 Code Files', 
          onPress: () => addMockFiles('code')
        },
        { 
          text: '🖼️ Images', 
          onPress: () => addMockFiles('image')
        },
      ]
    );
  };

  // Add mock files based on type
  const addMockFiles = (type) => {
    const mockFiles = {
      document: [
        { 
          id: `doc_${Date.now()}`, 
          name: 'completed_work.pdf', 
          size: '2.4 MB', 
          type: 'pdf',
          uploadTime: new Date().toISOString()
        },
        { 
          id: `doc_${Date.now() + 1}`, 
          name: 'additional_notes.docx', 
          size: '856 KB', 
          type: 'document',
          uploadTime: new Date().toISOString()
        }
      ],
      code: [
        { 
          id: `code_${Date.now()}`, 
          name: 'solution.py', 
          size: '12.3 KB', 
          type: 'python',
          uploadTime: new Date().toISOString()
        },
        { 
          id: `code_${Date.now() + 1}`, 
          name: 'requirements.txt', 
          size: '1.2 KB', 
          type: 'text',
          uploadTime: new Date().toISOString()
        }
      ],
      image: [
        { 
          id: `img_${Date.now()}`, 
          name: 'diagram.png', 
          size: '1.8 MB', 
          type: 'image',
          uploadTime: new Date().toISOString()
        },
        { 
          id: `img_${Date.now() + 1}`, 
          name: 'screenshot.jpg', 
          size: '945 KB', 
          type: 'image',
          uploadTime: new Date().toISOString()
        }
      ]
    };

    const newFiles = mockFiles[type] || mockFiles.document;
    setDeliveryFiles(prev => [...prev, ...newFiles]);
    
    // Show upload animation
    simulateUploadProgress();
  };

  // Simulate file upload progress
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  // Remove file from delivery
  const removeFile = (fileId) => {
    Alert.alert(
      'Remove File',
      'Are you sure you want to remove this file from your delivery?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            setDeliveryFiles(prev => prev.filter(file => file.id !== fileId));
          }
        }
      ]
    );
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    const icons = {
      'pdf': '📄',
      'document': '📝',
      'python': '🐍',
      'text': '📃',
      'image': '🖼️',
      'code': '💻'
    };
    return icons[type] || '📎';
  };

  // Handle delivery submission
  const handleSubmitDelivery = async () => {
    // Validation
    if (deliveryFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please add at least one file to your delivery.');
      return;
    }

    if (deliveryMessage.trim().length < 10) {
      Alert.alert(
        'Delivery Message',
        'Please add a brief message about your delivery (at least 10 characters).',
        [
          { text: 'Skip Message', onPress: () => submitDelivery() },
          { text: 'Add Message', style: 'cancel' }
        ]
      );
      return;
    }

    submitDelivery();
  };

  const submitDelivery = async () => {
    try {
      setUploading(true);

      const deliveryData = {
        files: deliveryFiles,
        message: deliveryMessage.trim() || 'Delivery completed as requested.',
        deliveryDate: new Date().toISOString(),
        totalFiles: deliveryFiles.length,
      };

      console.log('📤 Submitting delivery:', deliveryData);

      const response = await TasksAPI.submitTaskAction(
        task.id, 
        'upload', 
        'expert', 
        deliveryData
      );

      if (response.success) {
        // Show success with detailed info
        Alert.alert(
          '🎉 Delivery Uploaded Successfully!',
          `Your work for "${task.title}" has been delivered to ${task.requesterName}.\n\n✅ ${deliveryFiles.length} file(s) uploaded\n📝 Delivery message sent\n⏰ Delivered on time\n\nThe requester will be notified and can now review your work.`,
          [
            {
              text: 'View My Tasks',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'MyTasks' }],
                });
              }
            },
            {
              text: 'Done',
              style: 'default',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Delivery upload failed:', error);
      Alert.alert(
        'Upload Failed',
        error.message || 'Failed to upload your delivery. Please check your connection and try again.',
        [
          { text: 'Retry', onPress: handleSubmitDelivery },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📤 Upload Delivery</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Task Information Card */}
        <Animated.View style={[styles.taskInfoCard, { opacity: fadeAnim }]}>
          <View style={styles.taskHeader}>
            <View style={styles.taskTitleContainer}>
              <Text style={styles.taskTitle} numberOfLines={2}>
                {task.title}
              </Text>
              <View style={[styles.subjectBadge, { backgroundColor: subjectColor }]}>
                <Text style={styles.subjectText}>{task.subject}</Text>
              </View>
            </View>
            <Text style={styles.taskPrice}>{task.price}</Text>
          </View>

          <View style={styles.taskDetails}>
            <View style={styles.taskDetailRow}>
              <Text style={styles.taskDetailLabel}>👤 Requester:</Text>
              <Text style={styles.taskDetailValue}>{task.requesterName}</Text>
            </View>
            <View style={styles.taskDetailRow}>
              <Text style={styles.taskDetailLabel}>📅 Due Date:</Text>
              <Text style={[
                styles.taskDetailValue,
                daysLeftInfo.isOverdue && styles.overdueText,
                daysLeftInfo.isUrgent && styles.urgentText
              ]}>
                {formatDate(task.dueDate)} • {daysLeftInfo.text}
              </Text>
            </View>
            {task.status === 'revision_requested' && (
              <View style={styles.revisionNotice}>
                <Text style={styles.revisionIcon}>🔄</Text>
                <Text style={styles.revisionText}>
                  Revision requested - please address the feedback before resubmitting
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        {/* File Upload Section */}
        <Animated.View style={[styles.uploadSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>📁 Delivery Files</Text>
          <Text style={styles.sectionSubtitle}>
            Upload your completed work files
          </Text>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Uploading files...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
              </View>
              <Text style={styles.progressText}>{uploadProgress}%</Text>
            </View>
          )}

          {/* File Upload Button */}
          <TouchableOpacity 
            style={[styles.uploadButton, deliveryFiles.length > 0 && styles.uploadButtonActive]}
            onPress={handleFilePicker}
          >
            <Text style={styles.uploadButtonIcon}>
              {deliveryFiles.length > 0 ? '📁' : '⬆️'}
            </Text>
            <Text style={styles.uploadButtonText}>
              {deliveryFiles.length > 0 ? 'Add More Files' : 'Select Files to Upload'}
            </Text>
            <Text style={styles.uploadButtonSubtext}>
              Documents, code, images, etc.
            </Text>
          </TouchableOpacity>

          {/* Selected Files List */}
          {deliveryFiles.length > 0 && (
            <View style={styles.filesContainer}>
              <Text style={styles.filesHeader}>
                📋 Selected Files ({deliveryFiles.length})
              </Text>
              
              {deliveryFiles.map((file, index) => (
                <Animated.View 
                  key={file.id}
                  style={[
                    styles.fileItem,
                    { 
                      opacity: fadeAnim,
                      transform: [{
                        translateX: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <View style={styles.fileIcon}>
                    <Text style={styles.fileIconText}>{getFileIcon(file.type)}</Text>
                  </View>
                  
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{file.size}</Text>
                    <Text style={styles.fileTime}>
                      Added {new Date(file.uploadTime).toLocaleTimeString()}
                    </Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.removeFileButton}
                    onPress={() => removeFile(file.id)}
                  >
                    <Text style={styles.removeFileText}>✕</Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* Delivery Message Section */}
        <Animated.View style={[styles.messageSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>💬 Delivery Message</Text>
          <Text style={styles.sectionSubtitle}>
            Add a message about your completed work (optional but recommended)
          </Text>
          
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Hi! I've completed your task as requested. Please find the files attached. All requirements have been addressed and the work is ready for your review. Let me know if you need any clarifications!"
              placeholderTextColor="#999"
              multiline
              numberOfLines={5}
              value={deliveryMessage}
              onChangeText={setDeliveryMessage}
              maxLength={500}
              textAlignVertical="top"
            />
            <View style={styles.messageInputFooter}>
              <Text style={styles.charCount}>
                {deliveryMessage.length}/500 characters
              </Text>
              {deliveryMessage.length >= 10 && (
                <Text style={styles.validMessage}>✓ Good message!</Text>
              )}
            </View>
          </View>

          {/* Message Templates */}
          <View style={styles.templatesContainer}>
            <Text style={styles.templatesTitle}>💡 Quick Templates:</Text>
            <View style={styles.templatesRow}>
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => setDeliveryMessage('Task completed as requested. All files are attached and ready for review. Please let me know if you need any revisions!')}
              >
                <Text style={styles.templateButtonText}>✅ Standard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => setDeliveryMessage('I\'ve completed your task ahead of schedule! Everything is thoroughly tested and documented. Please review and let me know your feedback.')}
              >
                <Text style={styles.templateButtonText}>⚡ Early</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.templateButton}
                onPress={() => setDeliveryMessage('Revision completed! I\'ve addressed all the feedback points you mentioned. The updated files are attached and ready for your review.')}
              >
                <Text style={styles.templateButtonText}>🔄 Revision</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Bottom Submit Button */}
      <Animated.View style={[styles.submitContainer, { opacity: fadeAnim }]}>
        <View style={styles.submitSummary}>
          <Text style={styles.submitSummaryText}>
            📁 {deliveryFiles.length} file(s) ready • 💬 {deliveryMessage.length > 0 ? 'Message added' : 'No message'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.submitButton, 
            uploading && styles.submitButtonDisabled,
            deliveryFiles.length === 0 && styles.submitButtonInactive
          ]}
          onPress={handleSubmitDelivery}
          disabled={uploading || deliveryFiles.length === 0}
        >
          {uploading ? (
            <View style={styles.submitButtonContent}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.submitButtonText}>Uploading...</Text>
            </View>
          ) : (
            <View style={styles.submitButtonContent}>
              <Text style={styles.submitButtonIcon}>📤</Text>
              <Text style={styles.submitButtonText}>
                {task.status === 'revision_requested' ? 'Submit Revision' : 'Upload & Deliver'}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  headerRight: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Task Info Card
  taskInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
    lineHeight: 24,
  },
  subjectBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2e7d32',
  },
  taskDetails: {
    gap: 8,
  },
  taskDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  taskDetailValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
  },
  overdueText: {
    color: '#f44336',
  },
  urgentText: {
    color: '#ff9800',
  },
  revisionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  revisionIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  revisionText: {
    fontSize: 13,
    color: '#f57c00',
    flex: 1,
    fontWeight: '500',
  },

  // Upload Section
  uploadSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  
  // Progress
  progressContainer: {
    marginBottom: 20,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    fontWeight: '600',
  },
  
  // Upload Button
  uploadButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  uploadButtonActive: {
    backgroundColor: '#f8fff8',
    borderColor: '#2e7d32',
    borderStyle: 'solid',
  },
  uploadButtonIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  uploadButtonSubtext: {
    fontSize: 13,
    color: '#666',
  },
  
  // Files Container
  filesContainer: {
    backgroundColor: '#f8fff8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8f5e8',
  },
  filesHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileIconText: {
    fontSize: 18,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  fileTime: {
    fontSize: 11,
    color: '#999',
  },
  removeFileButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
  },

  // Message Section
  messageSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  messageInputContainer: {
    marginBottom: 16,
  },
  messageInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#111',
    textAlignVertical: 'top',
  },
  messageInputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
  },
  validMessage: {
    fontSize: 12,
    color: '#4caf50',
    fontWeight: '600',
  },
  
  // Templates
  templatesContainer: {
    marginTop: 8,
  },
  templatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templatesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  templateButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },

  // Submit Section
  bottomSpacer: {
    height: 120,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 8,
    elevation: 8,
  },
  submitSummary: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  submitSummaryText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonInactive: {
    backgroundColor: '#e0e0e0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonIcon: {
    fontSize: 18,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default UploadDeliveryScreen;