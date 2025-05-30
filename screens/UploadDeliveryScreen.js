// screens/UploadDeliveryScreen.js - Complete Enhanced Version
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📤 Upload Delivery</Text>
          <View style={styles.headerRight} />
        </View>
        
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

  const calculateDaysLeft = (dueDate) => {
    if (!dueDate) return { text: 'No due date', isNormal: true };
    
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isUrgent: true };
    if (diffDays === 1) return { text: '1 day left', isUrgent: true };
    return { text: `${diffDays} days left`, isNormal: true };
  };

  const getSubjectColor = (subject) => {
    const colors = {
      'Math': '#3f51b5',
      'Coding': '#00796b',
      'Writing': '#d84315',
      'Design': '#6a1b9a',
      'Language': '#00838f',
      'Chemistry': '#f57f17',
      'Physics': '#1976d2',
      'Business': '#388e3c',
      'Psychology': '#7b1fa2'
    };
    return colors[subject] || '#9e9e9e';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysLeftInfo = calculateDaysLeft(task.dueDate);
  const subjectColor = getSubjectColor(task.subject);

  // Enhanced mock file picker with categories
  const handleFilePicker = () => {
    Alert.alert(
      '📁 Select Files',
      'Choose the type of files you want to add:',
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
          text: '🖼️ Images/Screenshots', 
          onPress: () => addMockFiles('image')
        },
        { 
          text: '📊 Data/Spreadsheets', 
          onPress: () => addMockFiles('data')
        },
      ]
    );
  };

  // Enhanced mock files with realistic names
  const addMockFiles = (type) => {
    const mockFileTypes = {
      document: [
        { 
          id: `doc_${Date.now()}`, 
          name: `${task.subject.toLowerCase()}_solution.pdf`, 
          size: '2.4 MB', 
          type: 'pdf',
          uploadTime: new Date().toISOString(),
          category: 'Main Deliverable'
        },
        { 
          id: `doc_${Date.now() + 1}`, 
          name: 'explanation_and_notes.docx', 
          size: '856 KB', 
          type: 'document',
          uploadTime: new Date().toISOString(),
          category: 'Supporting Document'
        }
      ],
      code: [
        { 
          id: `code_${Date.now()}`, 
          name: task.subject === 'Coding' ? 'main_solution.py' : 'analysis_script.py', 
          size: '12.3 KB', 
          type: 'python',
          uploadTime: new Date().toISOString(),
          category: 'Source Code'
        },
        { 
          id: `code_${Date.now() + 1}`, 
          name: 'requirements.txt', 
          size: '1.2 KB', 
          type: 'text',
          uploadTime: new Date().toISOString(),
          category: 'Dependencies'
        },
        { 
          id: `code_${Date.now() + 2}`, 
          name: 'README.md', 
          size: '3.8 KB', 
          type: 'markdown',
          uploadTime: new Date().toISOString(),
          category: 'Documentation'
        }
      ],
      image: [
        { 
          id: `img_${Date.now()}`, 
          name: 'solution_diagram.png', 
          size: '1.8 MB', 
          type: 'image',
          uploadTime: new Date().toISOString(),
          category: 'Diagram'
        },
        { 
          id: `img_${Date.now() + 1}`, 
          name: 'process_screenshot.jpg', 
          size: '945 KB', 
          type: 'image',
          uploadTime: new Date().toISOString(),
          category: 'Screenshot'
        }
      ],
      data: [
        { 
          id: `data_${Date.now()}`, 
          name: 'analysis_results.xlsx', 
          size: '584 KB', 
          type: 'excel',
          uploadTime: new Date().toISOString(),
          category: 'Data Analysis'
        },
        { 
          id: `data_${Date.now() + 1}`, 
          name: 'raw_data.csv', 
          size: '234 KB', 
          type: 'csv',
          uploadTime: new Date().toISOString(),
          category: 'Raw Data'
        }
      ]
    };

    const newFiles = mockFileTypes[type] || mockFileTypes.document;
    setDeliveryFiles(prev => [...prev, ...newFiles]);
    
    // Show upload animation
    simulateUploadProgress();
  };

  // Enhanced upload progress simulation
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5; // Variable progress speed
      });
    }, 150);
  };

  // Remove file with confirmation
  const removeFile = (fileId) => {
    const file = deliveryFiles.find(f => f.id === fileId);
    Alert.alert(
      'Remove File',
      `Remove "${file.name}" from your delivery?`,
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

  // Enhanced file icons
  const getFileIcon = (type) => {
    const icons = {
      'pdf': '📄',
      'document': '📝',
      'python': '🐍',
      'text': '📃',
      'markdown': '📋',
      'image': '🖼️',
      'excel': '📊',
      'csv': '📈',
      'code': '💻'
    };
    return icons[type] || '📎';
  };

  // Predefined message templates
  const messageTemplates = [
    {
      id: 'standard',
      title: '✅ Standard Completion',
      message: `Hi ${task.requesterName}! I've completed your ${task.subject} task as requested. All requirements have been thoroughly addressed and the work is ready for your review. Please find the deliverable files attached. Let me know if you need any clarifications or have questions about the solution!`
    },
    {
      id: 'early',
      title: '⚡ Early Delivery',
      message: `Great news! I've completed your task ahead of schedule. Everything has been thoroughly tested and documented. The solution exceeds the basic requirements and includes additional insights that might be helpful. Please review the attached files and let me know your feedback!`
    },
    {
      id: 'revision',
      title: '🔄 Revision Submitted',
      message: `Thank you for your feedback! I've carefully addressed all the points you mentioned and made the necessary revisions. The updated files are attached and ready for your review. I believe this version better meets your expectations. Please let me know if any further adjustments are needed.`
    }
  ];

  // Handle delivery submission
  const handleSubmitDelivery = async () => {
    // Enhanced validation
    if (deliveryFiles.length === 0) {
      Alert.alert(
        'No Files Selected', 
        'Please add at least one file to your delivery before submitting.',
        [{ text: 'Add Files', onPress: handleFilePicker }]
      );
      return;
    }

    if (deliveryMessage.trim().length < 10) {
      Alert.alert(
        'Delivery Message Required',
        'A brief message helps the requester understand your delivery. Please add at least 10 characters.',
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
        fileCategories: [...new Set(deliveryFiles.map(f => f.category))],
      };

      console.log('📤 Submitting delivery:', deliveryData);

      const response = await TasksAPI.submitTaskAction(
        task.id, 
        'upload', 
        'expert', 
        deliveryData
      );

      if (response.success) {
        // Enhanced success message
        Alert.alert(
          '🎉 Delivery Uploaded Successfully!',
          `Your work for "${task.title}" has been delivered!\n\n✅ ${deliveryFiles.length} file(s) uploaded\n📝 Delivery message sent\n⏰ Delivered ${daysLeftInfo.isOverdue ? 'late' : daysLeftInfo.isUrgent ? 'on time' : 'early'}\n\n${task.requesterName} will be notified and can now review your work.`,
          [
            {
              text: 'View My Tasks',
              onPress: () => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
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
                <View style={[styles.progressFill, { width: `${Math.min(uploadProgress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            </View>
          )}

          {/* Enhanced Upload Button */}
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
              Documents, code, images, data files
            </Text>
          </TouchableOpacity>

          {/* Selected Files List with Categories */}
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
                    <Text style={styles.fileCategory}>{file.category}</Text>
                    <View style={styles.fileMetadata}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      <Text style={styles.fileTime}>
                        • Added {new Date(file.uploadTime).toLocaleTimeString()}
                      </Text>
                    </View>
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

        {/* Enhanced Message Section */}
        <Animated.View style={[styles.messageSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>💬 Delivery Message</Text>
          <Text style={styles.sectionSubtitle}>
            Add a message about your completed work
          </Text>
          
          <View style={styles.messageInputContainer}>
            <TextInput
              style={styles.messageInput}
              placeholder="Add a professional message about your delivery..."
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

          {/* Enhanced Message Templates */}
          <View style={styles.templatesContainer}>
            <Text style={styles.templatesTitle}>💡 Quick Templates:</Text>
            <View style={styles.templatesGrid}>
              {messageTemplates.map((template) => (
                <TouchableOpacity 
                  key={template.id}
                  style={styles.templateCard}
                  onPress={() => setDeliveryMessage(template.message)}
                >
                  <Text style={styles.templateTitle}>{template.title}</Text>
                  <Text style={styles.templatePreview} numberOfLines={2}>
                    {template.message.substring(0, 80)}...
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Enhanced Fixed Bottom Submit Button */}
      <Animated.View style={[styles.submitContainer, { opacity: fadeAnim }]}>
        <View style={styles.submitSummary}>
          <Text style={styles.submitSummaryText}>
            📁 {deliveryFiles.length} file(s) • 💬 {deliveryMessage.length > 10 ? 'Message ready' : 'Add message'} • {daysLeftInfo.isOverdue ? '⚠️ Late' : daysLeftInfo.isUrgent ? '⏰ Due today' : '✅ On time'}
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
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
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
  fileCategory: {
    fontSize: 11,
    color: '#2e7d32',
    fontWeight: '500',
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fileMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
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
  
  // Enhanced Templates
  templatesContainer: {
    marginTop: 8,
  },
  templatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templatesGrid: {
    gap: 8,
  },
  templateCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  templateTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templatePreview: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
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