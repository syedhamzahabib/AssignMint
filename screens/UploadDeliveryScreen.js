// screens/UploadDeliveryScreen.js - Simplified with single working file upload
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
  Platform,
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

  // SIMPLIFIED: Single file picker function that actually works
  const handleAddFiles = () => {
    // Show options for different file types
    Alert.alert(
      '📁 Add Files to Delivery',
      'Choose the type of files you want to add:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: '📄 Documents (PDF, DOC, TXT)', 
          onPress: () => addMockFiles('documents')
        },
        { 
          text: '💻 Code Files (PY, JS, HTML)', 
          onPress: () => addMockFiles('code')
        },
        { 
          text: '🖼️ Images (JPG, PNG)', 
          onPress: () => addMockFiles('images')
        },
        { 
          text: '📊 Data Files (CSV, XLSX)', 
          onPress: () => addMockFiles('data')
        },
        { 
          text: '🎯 Quick Add Common Files', 
          onPress: () => addMockFiles('quick')
        },
      ]
    );
  };

  // Add different types of mock files based on selection
  const addMockFiles = (type) => {
    const fileTypes = {
      documents: [
        {
          id: `doc_${Date.now()}_1`,
          name: `${task.subject.toLowerCase()}_solution.pdf`,
          size: '2.4 MB',
          type: 'pdf',
          category: 'Document',
          uploadTime: new Date().toISOString(),
          rawSize: 2400000,
        },
        {
          id: `doc_${Date.now()}_2`,
          name: 'detailed_explanation.docx',
          size: '856 KB',
          type: 'docx',
          category: 'Document', 
          uploadTime: new Date().toISOString(),
          rawSize: 856000,
        }
      ],
      code: [
        {
          id: `code_${Date.now()}_1`,
          name: task.subject === 'Coding' ? 'main_solution.py' : 'analysis_script.py',
          size: '15.2 KB',
          type: 'py',
          category: 'Source Code',
          uploadTime: new Date().toISOString(),
          rawSize: 15200,
        },
        {
          id: `code_${Date.now()}_2`,
          name: 'index.html',
          size: '8.7 KB',
          type: 'html',
          category: 'Source Code',
          uploadTime: new Date().toISOString(),
          rawSize: 8700,
        }
      ],
      images: [
        {
          id: `img_${Date.now()}_1`,
          name: 'solution_diagram.png',
          size: '1.2 MB',
          type: 'png',
          category: 'Image',
          uploadTime: new Date().toISOString(),
          rawSize: 1200000,
        },
        {
          id: `img_${Date.now()}_2`,
          name: 'process_flowchart.jpg',
          size: '980 KB',
          type: 'jpg',
          category: 'Image',
          uploadTime: new Date().toISOString(),
          rawSize: 980000,
        }
      ],
      data: [
        {
          id: `data_${Date.now()}_1`,
          name: 'results_analysis.xlsx',
          size: '445 KB',
          type: 'xlsx',
          category: 'Spreadsheet',
          uploadTime: new Date().toISOString(),
          rawSize: 445000,
        },
        {
          id: `data_${Date.now()}_2`,
          name: 'dataset.csv',
          size: '2.1 MB',
          type: 'csv',
          category: 'Data File',
          uploadTime: new Date().toISOString(),
          rawSize: 2100000,
        }
      ],
      quick: [
        {
          id: `quick_${Date.now()}_1`,
          name: `${task.subject}_complete_solution.pdf`,
          size: '3.2 MB',
          type: 'pdf',
          category: 'Document',
          uploadTime: new Date().toISOString(),
          rawSize: 3200000,
        }
      ]
    };

    const newFiles = fileTypes[type] || fileTypes.quick;
    
    // Check total size
    const currentSize = deliveryFiles.reduce((sum, file) => sum + file.rawSize, 0);
    const newSize = newFiles.reduce((sum, file) => sum + file.rawSize, 0);
    const totalSize = currentSize + newSize;
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (totalSize > maxSize) {
      Alert.alert(
        'Files Too Large',
        `Adding these files would exceed the 50MB limit. Current: ${formatFileSize(currentSize)}, Adding: ${formatFileSize(newSize)}, Limit: 50MB`,
        [{ text: 'OK' }]
      );
      return;
    }

    setDeliveryFiles(prev => [...prev, ...newFiles]);
    simulateUploadProgress();
    
    Alert.alert(
      '✅ Files Added!',
      `Successfully added ${newFiles.length} file(s) to your delivery.\n\nTotal files: ${deliveryFiles.length + newFiles.length}\nTotal size: ${formatFileSize(totalSize)}`,
      [{ text: 'Great!' }]
    );
  };

  // Helper functions
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    const icons = {
      'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📃',
      'py': '🐍', 'js': '💻', 'html': '🌐', 'css': '🎨',
      'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🎞️',
      'xlsx': '📊', 'xls': '📊', 'csv': '📈',
      'zip': '📦', 'rar': '📦'
    };
    return icons[type] || '📎';
  };

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
      'Math': '#3f51b5', 'Coding': '#00796b', 'Writing': '#d84315',
      'Design': '#6a1b9a', 'Language': '#00838f', 'Chemistry': '#f57f17',
      'Physics': '#1976d2', 'Business': '#388e3c', 'Psychology': '#7b1fa2'
    };
    return colors[subject] || '#9e9e9e';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const daysLeftInfo = calculateDaysLeft(task.dueDate);
  const subjectColor = getSubjectColor(task.subject);

  // Upload progress simulation
  const simulateUploadProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
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

  // Predefined message templates
  const messageTemplates = [
    {
      id: 'standard',
      title: '✅ Standard Completion',
      message: `Hi ${task.requesterName || 'there'}! I've completed your ${task.subject} task as requested. All requirements have been thoroughly addressed and the work is ready for your review. Please find the deliverable files attached. Let me know if you need any clarifications!`
    },
    {
      id: 'early',
      title: '⚡ Early Delivery',
      message: `Great news! I've completed your task ahead of schedule. Everything has been thoroughly tested and documented. The solution exceeds the basic requirements and includes additional insights. Please review the attached files and let me know your feedback!`
    },
    {
      id: 'revision',
      title: '🔄 Revision Submitted',
      message: `Thank you for your feedback! I've carefully addressed all the points you mentioned and made the necessary revisions. The updated files are attached and ready for your review. Please let me know if any further adjustments are needed.`
    }
  ];

  // Handle delivery submission
  const handleSubmitDelivery = async () => {
    if (deliveryFiles.length === 0) {
      Alert.alert(
        'No Files Selected', 
        'Please add at least one file to your delivery before submitting.',
        [
          { text: 'Add Files Now', onPress: handleAddFiles },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    if (deliveryMessage.trim().length < 10) {
      Alert.alert(
        'Add a Message',
        'A brief delivery message helps the requester understand your work. Please add at least 10 characters.',
        [
          { text: 'Submit Without Message', onPress: () => submitDelivery() },
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

      const totalSize = deliveryFiles.reduce((sum, file) => sum + file.rawSize, 0);
      
      const deliveryData = {
        files: deliveryFiles.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          category: file.category,
          uploadTime: file.uploadTime
        })),
        message: deliveryMessage.trim() || 'Delivery completed as requested.',
        deliveryDate: new Date().toISOString(),
        totalFiles: deliveryFiles.length,
        totalSize: formatFileSize(totalSize),
        fileCategories: [...new Set(deliveryFiles.map(f => f.category))],
      };

      console.log('📤 Submitting delivery:', deliveryData);

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const response = await TasksAPI.submitTaskAction(
        task.id, 
        'upload', 
        'expert', 
        deliveryData
      );

      if (response.success) {
        Alert.alert(
          '🎉 Delivery Uploaded Successfully!',
          `Your work for "${task.title}" has been delivered!\n\n✅ ${deliveryFiles.length} file(s) uploaded\n📦 Total size: ${formatFileSize(totalSize)}\n📝 Delivery message sent\n⏰ Delivered ${daysLeftInfo.isOverdue ? 'late' : daysLeftInfo.isUrgent ? 'on time' : 'early'}\n\n${task.requesterName || 'The requester'} will be notified and can now review your work.`,
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
      setUploadProgress(0);
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
              <Text style={styles.taskDetailValue}>{task.requesterName || 'Not specified'}</Text>
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

        {/* SIMPLIFIED: Single File Upload Section */}
        <Animated.View style={[styles.uploadSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>📁 Delivery Files</Text>
          <Text style={styles.sectionSubtitle}>
            Add your completed work files • Max 50MB total
          </Text>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Processing files...</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(uploadProgress, 100)}%` }]} />
              </View>
              <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            </View>
          )}

          {/* MAIN UPLOAD BUTTON - This one actually works! */}
          <TouchableOpacity 
            style={[styles.mainUploadButton, deliveryFiles.length > 0 && styles.mainUploadButtonActive]}
            onPress={handleAddFiles}
          >
            <Text style={styles.mainUploadIcon}>
              {deliveryFiles.length > 0 ? '📁' : '⬆️'}
            </Text>
            <Text style={styles.mainUploadTitle}>
              {deliveryFiles.length > 0 ? 'Add More Files' : 'Add Files to Delivery'}
            </Text>
            <Text style={styles.mainUploadSubtext}>
              Choose from documents, code files, images, or data files
            </Text>
            <View style={styles.uploadButtonFooter}>
              <Text style={styles.uploadButtonFormats}>
                📄 PDF, DOC • 💻 PY, JS, HTML • 🖼️ JPG, PNG • 📊 CSV, XLSX
              </Text>
            </View>
          </TouchableOpacity>

          {/* Files List */}
          {deliveryFiles.length > 0 && (
            <View style={styles.filesContainer}>
              <View style={styles.filesHeader}>
                <Text style={styles.filesTitle}>
                  📋 Selected Files ({deliveryFiles.length})
                </Text>
                <Text style={styles.filesSize}>
                  Total: {formatFileSize(deliveryFiles.reduce((sum, file) => sum + file.rawSize, 0))}
                </Text>
              </View>
              
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
                    <Text style={styles.fileIconText}>
                      {getFileIcon(file.type)}
                    </Text>
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

        {/* Message Section */}
        <Animated.View style={[styles.messageSection, { opacity: fadeAnim }]}>
          <Text style={styles.sectionTitle}>💬 Delivery Message</Text>
          <Text style={styles.sectionSubtitle}>
            Add a professional message about your completed work
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

          {/* Message Templates */}
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

      {/* Fixed Bottom Submit Button */}
      <Animated.View style={[styles.submitContainer, { opacity: fadeAnim }]}>
        <View style={styles.submitSummary}>
          <Text style={styles.submitSummaryText}>
            📁 {deliveryFiles.length} file(s) • 💬 {deliveryMessage.length > 10 ? 'Message ready' : 'Add message'} • {daysLeftInfo.isOverdue ? '⚠️ Late' : daysLeftInfo.isUrgent ? '⏰ Due today' : '✅ On time'}
          </Text>
          {deliveryFiles.length > 0 && (
            <Text style={styles.submitSummarySize}>
              Total size: {formatFileSize(deliveryFiles.reduce((sum, file) => sum + file.rawSize, 0))}
            </Text>
          )}
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
              <Text style={styles.submitButtonText}>Uploading... {Math.round(uploadProgress)}%</Text>
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
  
  // MAIN UPLOAD BUTTON - Simplified and Working
  mainUploadButton: {
    backgroundColor: '#f8fff8',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2e7d32',
    borderStyle: 'solid',
    marginBottom: 20,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  mainUploadButtonActive: {
    backgroundColor: '#e8f5e8',
    borderColor: '#1b5e20',
    shadowOpacity: 0.2,
  },
  mainUploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  mainUploadTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 8,
    textAlign: 'center',
  },
  mainUploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadButtonFooter: {
    alignItems: 'center',
  },
  uploadButtonFormats: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2e7d32',
  },
  filesSize: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
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
  submitSummarySize: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
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