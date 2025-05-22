import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TasksAPI } from '../api/tasks';

const TaskActionModal = ({ 
  visible, 
  onClose, 
  task, 
  actionType, 
  isRequester = true,
  onActionComplete 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    rating: 5,
    feedback: '',
    disputeReason: '',
    files: [],
    message: ''
  });

  const handleSubmitAction = async () => {
    try {
      setLoading(true);
      
      let actionData = {};
      
      switch (actionType) {
        case 'review':
          if (!formData.feedback.trim()) {
            Alert.alert('Required', 'Please provide feedback');
            return;
          }
          actionData = {
            rating: formData.rating,
            feedback: formData.feedback,
            approved: true
          };
          break;
          
        case 'dispute':
          if (!formData.disputeReason.trim()) {
            Alert.alert('Required', 'Please provide a dispute reason');
            return;
          }
          actionData = {
            reason: formData.disputeReason,
            files: formData.files
          };
          break;
          
        case 'upload':
          if (formData.files.length === 0) {
            Alert.alert('Required', 'Please select files to upload');
            return;
          }
          actionData = {
            files: formData.files,
            message: formData.message
          };
          break;
          
        default:
          actionData = formData;
      }

      const response = await TasksAPI.submitTaskAction(
        task.id, 
        actionType, 
        isRequester ? 'requester' : 'expert', 
        actionData
      );
      
      if (response.success) {
        Alert.alert('Success', response.message);
        onActionComplete && onActionComplete(actionType, actionData);
        onClose();
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const renderActionContent = () => {
    switch (actionType) {
      case 'review':
        return renderReviewContent();
      case 'dispute':
        return renderDisputeContent();
      case 'upload':
        return renderUploadContent();
      default:
        return renderDefaultContent();
    }
  };

  const renderReviewContent = () => (
    <View style={styles.actionContent}>
      <Text style={styles.contentTitle}>Review & Approve Task</Text>
      <Text style={styles.contentSubtitle}>
        Review the completed work and provide your feedback
      </Text>

      {/* Rating */}
      <View style={styles.ratingSection}>
        <Text style={styles.fieldLabel}>Rating</Text>
        <View style={styles.ratingContainer}>
          {[1, 2, 3, 4, 5].map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setFormData(prev => ({ ...prev, rating: star }))}
              style={styles.starButton}
            >
              <Text style={[
                styles.star,
                star <= formData.rating && styles.starSelected
              ]}>
                ⭐
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.ratingText}>
            {formData.rating}/5 - {getRatingLabel(formData.rating)}
          </Text>
        </View>
      </View>

      {/* Feedback */}
      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Feedback *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Share your thoughts about the completed work..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={formData.feedback}
          onChangeText={(text) => setFormData(prev => ({ ...prev, feedback: text }))}
          maxLength={500}
        />
        <Text style={styles.charCount}>{formData.feedback.length}/500</Text>
      </View>
    </View>
  );

  const renderDisputeContent = () => (
    <View style={styles.actionContent}>
      <Text style={styles.contentTitle}>File a Dispute</Text>
      <Text style={styles.contentSubtitle}>
        Explain the issue with the completed work
      </Text>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Dispute Reason *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe the issue in detail..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={formData.disputeReason}
          onChangeText={(text) => setFormData(prev => ({ ...prev, disputeReason: text }))}
          maxLength={1000}
        />
        <Text style={styles.charCount}>{formData.disputeReason.length}/1000</Text>
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Supporting Files (Optional)</Text>
        <TouchableOpacity style={styles.fileUploadButton}>
          <Text style={styles.fileUploadIcon}>📎</Text>
          <Text style={styles.fileUploadText}>Add supporting documents</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUploadContent = () => (
    <View style={styles.actionContent}>
      <Text style={styles.contentTitle}>Upload Delivery</Text>
      <Text style={styles.contentSubtitle}>
        Upload your completed work files
      </Text>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Files *</Text>
        <TouchableOpacity style={styles.fileUploadButton}>
          <Text style={styles.fileUploadIcon}>📁</Text>
          <Text style={styles.fileUploadText}>Select files to upload</Text>
        </TouchableOpacity>
        {formData.files.length > 0 && (
          <Text style={styles.filesCount}>{formData.files.length} file(s) selected</Text>
        )}
      </View>

      <View style={styles.fieldSection}>
        <Text style={styles.fieldLabel}>Message (Optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Add a message about your delivery..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          value={formData.message}
          onChangeText={(text) => setFormData(prev => ({ ...prev, message: text }))}
          maxLength={300}
        />
        <Text style={styles.charCount}>{formData.message.length}/300</Text>
      </View>
    </View>
  );

  const renderDefaultContent = () => (
    <View style={styles.actionContent}>
      <Text style={styles.contentTitle}>{actionType.charAt(0).toUpperCase() + actionType.slice(1)}</Text>
      <Text style={styles.contentSubtitle}>
        This action is coming soon!
      </Text>
    </View>
  );

  const getRatingLabel = (rating) => {
    const labels = {
      1: 'Poor',
      2: 'Fair', 
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating] || 'Good';
  };

  const getActionButtonText = () => {
    switch (actionType) {
      case 'review': return 'Approve & Submit Review';
      case 'dispute': return 'Submit Dispute';
      case 'upload': return 'Upload Files';
      default: return 'Submit';
    }
  };

  const getActionButtonColor = () => {
    switch (actionType) {
      case 'review': return '#4caf50';
      case 'dispute': return '#ff5722';
      case 'upload': return '#2e7d32';
      default: return '#2196f3';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {task?.title}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {renderActionContent()}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.actionButton, 
                { backgroundColor: getActionButtonColor() },
                loading && styles.disabledButton
              ]} 
              onPress={handleSubmitAction}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.actionButtonText}>
                  {getActionButtonText()}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    flex: 1,
    marginRight: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  actionContent: {
    paddingVertical: 16,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  contentSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  ratingSection: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  starButton: {
    marginRight: 4,
  },
  star: {
    fontSize: 28,
    opacity: 0.3,
  },
  starSelected: {
    opacity: 1,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    fontWeight: '500',
  },
  fieldSection: {
    marginBottom: 24,
  },
  textArea: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#e9ecef',
    color: '#111',
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  fileUploadButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  fileUploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  fileUploadText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  filesCount: {
    fontSize: 14,
    color: '#2e7d32',
    marginTop: 8,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  actionButton: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default TaskActionModal;