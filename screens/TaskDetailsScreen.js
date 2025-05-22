import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { TasksAPI } from '../api/tasks';

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId, role, task: initialTask } = route.params;
  const [task, setTask] = useState(initialTask || null);
  const [loading, setLoading] = useState(!initialTask);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({ title: '', message: '', buttons: [] });

  const isRequester = role === 'requester';

  useEffect(() => {
    if (!initialTask) {
      loadTaskDetails();
    }
  }, [taskId, role]);

  // Load task details from API
  const loadTaskDetails = async () => {
    try {
      setLoading(true);
      console.log(`📡 Loading task details for ${taskId}...`);
      
      const response = await TasksAPI.getTaskById(taskId, role);
      if (response.success) {
        setTask(response.data);
        console.log(`✅ Loaded task: ${response.data.title}`);
      }
    } catch (error) {
      console.error('❌ Failed to load task details:', error);
      showCustomModal(
        '❌ Loading Error',
        'Failed to load task details. Please try again.',
        [
          { text: 'Retry', onPress: () => { setShowModal(false); loadTaskDetails(); } },
          { text: 'Go Back', onPress: () => { setShowModal(false); navigation.goBack(); } }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Custom Modal Function
  const showCustomModal = (title, message, buttons = []) => {
    setModalData({ title, message, buttons });
    setShowModal(true);
  };

  // Handle action buttons
  const handleAction = async (action) => {
    console.log(`🎬 Action: ${action} for task: ${task.title}`);
    
    switch (action) {
      case 'review':
        showCustomModal(
          '✅ Review & Approve',
          `Task: "${task.title}"\nExpert: ${task.expertName}\nPrice: ${task.price}\n\nApprove this completed work?\n\nThis will release payment to the expert.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Approve & Pay ✅', 
              style: 'primary',
              onPress: () => submitAction(action)
            }
          ]
        );
        break;
        
      case 'dispute':
        showCustomModal(
          '🚩 File Dispute',
          `Task: "${task.title}"\nExpert: ${task.expertName}\n\nFile a dispute about the quality of work?\n\n⚠️ This will pause payment and start a review process.\n\nOur team will investigate within 24 hours.`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'File Dispute 🚩', 
              style: 'destructive',
              onPress: () => submitAction(action)
            }
          ]
        );
        break;
        
      case 'cancel':
        showCustomModal(
          '❌ Cancel Task',
          `Task: "${task.title}"\nPrice: ${task.price}\n\n⚠️ Warning: This action cannot be undone.\n\nThe task will be cancelled and refund processed within 24 hours.`,
          [
            { text: 'Keep Task', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Cancel Task ❌', 
              style: 'destructive',
              onPress: () => submitAction(action)
            }
          ]
        );
        break;
        
      case 'upload':
        showCustomModal(
          '🟩 Upload Delivery',
          `Task: "${task.title}"\nRequester: ${task.requesterName}\n\nReady to upload your completed work?\n\n✓ Make sure all requirements are met\n✓ Files are properly formatted\n✓ Work is complete and reviewed`,
          [
            { text: 'Not Ready', style: 'cancel', onPress: () => setShowModal(false) },
            { 
              text: 'Upload Files 📁', 
              style: 'primary',
              onPress: () => submitAction(action)
            }
          ]
        );
        break;
        
      case 'edit':
        showCustomModal(
          '🟨 Edit Task', 
          `Edit "${task.title}"\n\nThis would open the task editor where you can:\n\n• Modify requirements\n• Adjust deadline\n• Update budget\n• Add instructions`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) },
            { text: 'Edit Task 🟨', onPress: () => setShowModal(false) }
          ]
        );
        break;
        
      default:
        showCustomModal(
          'Action', 
          `${action} for "${task.title}"`,
          [{ text: 'OK', onPress: () => setShowModal(false) }]
        );
    }
  };

  // Submit action to API
  const submitAction = async (action) => {
    try {
      setActionLoading(true);
      setShowModal(false);
      
      console.log(`🚀 Submitting ${action} to API...`);
      
      // Show loading modal
      showCustomModal(
        '⏳ Processing...',
        `Processing your ${action} request...\n\nThis may take a moment.`,
        []
      );
      
      const response = await TasksAPI.submitTaskAction(task.id, action, role);
      
      setShowModal(false);
      
      if (response.success) {
        // Update task status locally
        if (response.data.newStatus) {
          setTask(prev => ({ ...prev, status: response.data.newStatus }));
        }
        
        // Show success message
        setTimeout(() => {
          showCustomModal(
            '✅ Success!',
            response.message,
            [{ 
              text: 'OK', 
              onPress: () => { 
                setShowModal(false); 
                // Navigate back with updated data
                navigation.goBack();
              } 
            }]
          );
        }, 300);
      }
    } catch (error) {
      console.error(`❌ ${action} failed:`, error);
      setShowModal(false);
      
      setTimeout(() => {
        showCustomModal(
          '❌ Action Failed',
          error.message || `Failed to ${action} task. Please try again.`,
          [
            { text: 'Retry', onPress: () => { setShowModal(false); submitAction(action); } },
            { text: 'Cancel', style: 'cancel', onPress: () => setShowModal(false) }
          ]
        );
      }, 300);
    } finally {
      setActionLoading(false);
    }
  };

  // Calculate days left until due date
  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { text: `${Math.abs(diffDays)} days overdue`, isOverdue: true };
    if (diffDays === 0) return { text: 'Due today', isUrgent: true };
    if (diffDays === 1) return { text: '1 day left', isUrgent: true };
    return { text: `${diffDays} days left`, isNormal: true };
  };

  // Get status display info
  const getStatusInfo = (status) => {
    const statusMap = {
      in_progress: { text: '🔄 In Progress', color: '#2196f3', bgColor: '#e3f2fd' },
      pending_review: { text: '⏳ Pending Review', color: '#ff9800', bgColor: '#fff3e0' },
      completed: { text: '✅ Completed', color: '#4caf50', bgColor: '#e8f5e8' },
      awaiting_expert: { text: '👀 Finding Expert', color: '#9c27b0', bgColor: '#f3e5f5' },
      disputed: { text: '⚠️ Disputed', color: '#f44336', bgColor: '#ffebee' },
      cancelled: { text: '❌ Cancelled', color: '#757575', bgColor: '#f5f5f5' },
      working: { text: '🔨 Working', color: '#2196f3', bgColor: '#e3f2fd' },
      delivered: { text: '📤 Delivered', color: '#ff9800', bgColor: '#fff3e0' },
      payment_received: { text: '💰 Payment Received', color: '#4caf50', bgColor: '#e8f5e8' },
      revision_requested: { text: '🔄 Revision Requested', color: '#ff5722', bgColor: '#fbe9e7' },
    };
    return statusMap[status] || { text: status, color: '#757575', bgColor: '#f5f5f5' };
  };

  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'image': case 'jpg': case 'png': return '🖼️';
      case 'document': case 'docx': return '📝';
      case 'excel': case 'xlsx': return '📊';
      case 'python': case 'js': return '💻';
      case 'csv': return '📈';
      case 'text': case 'txt': return '📃';
      case 'archive': case 'zip': return '📦';
      case 'design': case 'figma': return '🎨';
      case 'markdown': case 'md': return '📋';
      default: return '📎';
    }
  };

  // Get urgency styling
  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'high': return { backgroundColor: '#ffebee', color: '#f44336', icon: '🔥' };
      case 'medium': return { backgroundColor: '#fff3e0', color: '#ff9800', icon: '⚡' };
      case 'low': return { backgroundColor: '#e8f5e8', color: '#4caf50', icon: '🌱' };
      default: return { backgroundColor: '#f5f5f5', color: '#757575', icon: '📋' };
    }
  };

  // Render action buttons
  const renderActionButtons = () => {
    if (!task) return null;

    if (isRequester) {
      switch (task.status) {
        case 'pending_review':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => handleAction('review')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>✅ Review & Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.disputeButton]}
                onPress={() => handleAction('dispute')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>🚩 File Dispute</Text>
              </TouchableOpacity>
            </View>
          );
        case 'in_progress':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleAction('cancel')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>❌ Cancel Task</Text>
              </TouchableOpacity>
            </View>
          );
        case 'awaiting_expert':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleAction('edit')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>🟨 Edit Task</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => handleAction('cancel')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>❌ Cancel Task</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    } else {
      // Expert actions
      switch (task.status) {
        case 'working':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.uploadButton]}
                onPress={() => handleAction('upload')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>🟩 Upload Delivery</Text>
              </TouchableOpacity>
            </View>
          );
        case 'revision_requested':
          return (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.uploadButton]}
                onPress={() => handleAction('upload')}
                disabled={actionLoading}
              >
                <Text style={styles.actionButtonText}>🔄 Submit Revision</Text>
              </TouchableOpacity>
            </View>
          );
        default:
          return null;
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading task details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Task Details</Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Task Not Found</Text>
          <Text style={styles.errorText}>The requested task could not be found.</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(task.status);
  const daysLeftInfo = calculateDaysLeft(task.dueDate);
  const urgencyStyle = getUrgencyStyle(task.urgency);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Task Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title and Price Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleHeader}>
            <View style={styles.titleContainer}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <View style={styles.badgeContainer}>
                <View style={[styles.subjectBadge, { backgroundColor: getSubjectColor(task.subject) }]}>
                  <Text style={styles.subjectText}>{task.subject}</Text>
                </View>
                {task.urgency && (
                  <View style={[styles.urgencyBadge, { backgroundColor: urgencyStyle.backgroundColor }]}>
                    <Text style={[styles.urgencyText, { color: urgencyStyle.color }]}>
                      {urgencyStyle.icon} {task.urgency.toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{task.price}</Text>
              <Text style={styles.priceLabel}>Total Budget</Text>
            </View>
          </View>
        </View>

        {/* Status and Due Date Section */}
        <View style={styles.statusSection}>
          <View style={styles.statusRow}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.text}
              </Text>
            </View>
            <View style={[
              styles.dueDateBadge,
              daysLeftInfo.isOverdue && styles.overdueBadge,
              daysLeftInfo.isUrgent && styles.urgentBadge,
              daysLeftInfo.isNormal && styles.normalBadge
            ]}>
              <Text style={[
                styles.dueDateText,
                daysLeftInfo.isOverdue && styles.overdueText,
                daysLeftInfo.isUrgent && styles.urgentText,
                daysLeftInfo.isNormal && styles.normalText
              ]}>
                📅 Due {task.dueDate} • {daysLeftInfo.text}
              </Text>
            </View>
          </View>
          
          {/* Progress bar for expert tasks */}
          {!isRequester && task.progress !== undefined && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressValue}>{task.progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${task.progress}%` }]} />
              </View>
            </View>
          )}
        </View>

        {/* People Involved Section */}
        <View style={styles.peopleSection}>
          <Text style={styles.sectionTitle}>👥 People Involved</Text>
          {isRequester ? (
            <View style={styles.personCard}>
              <View style={styles.personHeader}>
                <Text style={styles.personRole}>Expert</Text>
                {task.expertRating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {task.expertRating}</Text>
                    <Text style={styles.completedTasks}>({task.expertCompletedTasks} completed)</Text>
                  </View>
                )}
              </View>
              <Text style={styles.personName}>
                {task.expertName || 'No expert assigned yet'}
              </Text>
            </View>
          ) : (
            <View style={styles.personCard}>
              <View style={styles.personHeader}>
                <Text style={styles.personRole}>Requester</Text>
                {task.requesterRating && (
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>⭐ {task.requesterRating}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.personName}>{task.requesterName}</Text>
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>📝 Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {/* Requirements Section */}
        {task.requirements && task.requirements.length > 0 && (
          <View style={styles.requirementsSection}>
            <Text style={styles.sectionTitle}>✅ Requirements</Text>
            {task.requirements.map((requirement, index) => (
              <View key={index} style={styles.requirementItem}>
                <Text style={styles.requirementBullet}>•</Text>
                <Text style={styles.requirementText}>{requirement}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Attachments Section */}
        {task.attachments && task.attachments.length > 0 && (
          <View style={styles.attachmentsSection}>
            <Text style={styles.sectionTitle}>📎 Attachments</Text>
            {task.attachments.map((attachment, index) => (
              <TouchableOpacity key={index} style={styles.fileItem}>
                <View style={styles.fileIcon}>
                  <Text style={styles.fileIconText}>
                    {getFileIcon(attachment.type)}
                  </Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{attachment.name}</Text>
                  <Text style={styles.fileSize}>{attachment.size}</Text>
                </View>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Deliverables Section (for completed tasks) */}
        {task.deliverables && task.deliverables.length > 0 && (
          <View style={styles.deliverablesSection}>
            <Text style={styles.sectionTitle}>📦 Deliverables</Text>
            {task.deliverables.map((deliverable, index) => (
              <TouchableOpacity key={index} style={styles.deliverableItem}>
                <View style={styles.fileIcon}>
                  <Text style={styles.fileIconText}>
                    {getFileIcon(deliverable.type)}
                  </Text>
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{deliverable.name}</Text>
                  <Text style={styles.fileSize}>{deliverable.size}</Text>
                </View>
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Task Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>ℹ️ Task Information</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Posted:</Text>
            <Text style={styles.infoValue}>{task.postedDate || task.acceptedDate}</Text>
          </View>
          
          {task.estimatedHours && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Time:</Text>
              <Text style={styles.infoValue}>{task.estimatedHours} hours</Text>
            </View>
          )}
          
          {task.aiLevel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>AI Level:</Text>
              <Text style={styles.infoValue}>
                {task.aiLevel === 'none' ? 'No AI (Human only)' : 
                 task.aiLevel === 'partial' ? `Partial AI (${task.aiPercentage}%)` : 
                 'Full AI (100%)'}
              </Text>
            </View>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tags:</Text>
              <View style={styles.tagsContainer}>
                {task.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Special Notes Section */}
        {(task.disputeReason || task.revisionNotes || task.feedback) && (
          <View style={styles.notesSection}>
            <Text style={styles.sectionTitle}>📋 Notes & Feedback</Text>
            
            {task.disputeReason && (
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>⚠️ Dispute Reason:</Text>
                <Text style={styles.noteText}>{task.disputeReason}</Text>
              </View>
            )}
            
            {task.revisionNotes && (
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>🔄 Revision Notes:</Text>
                <Text style={styles.noteText}>{task.revisionNotes}</Text>
              </View>
            )}
            
            {task.feedback && (
              <View style={styles.feedbackCard}>
                <Text style={styles.noteTitle}>⭐ Feedback:</Text>
                {task.rating && (
                  <View style={styles.ratingRow}>
                    <Text style={styles.ratingStars}>
                      {'⭐'.repeat(task.rating)}{'☆'.repeat(5 - task.rating)}
                    </Text>
                    <Text style={styles.ratingNumber}>({task.rating}/5)</Text>
                  </View>
                )}
                <Text style={styles.feedbackText}>{task.feedback}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing for fixed buttons */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Action Buttons */}
      {renderActionButtons() && (
        <View style={styles.actionButtonsContainer}>
          {renderActionButtons()}
        </View>
      )}

      {/* Custom Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{modalData.title}</Text>
            <Text style={styles.modalMessage}>{modalData.message}</Text>
            
            {actionLoading && (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="small" color="#2e7d32" />
              </View>
            )}
            
            <View style={styles.modalButtons}>
              {modalData.buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.modalButton,
                    button.style === 'cancel' && styles.modalButtonCancel,
                    button.style === 'destructive' && styles.modalButtonDestructive,
                    button.style === 'primary' && styles.modalButtonPrimary,
                    actionLoading && styles.modalButtonDisabled
                  ]}
                  onPress={button.onPress}
                  disabled={actionLoading}
                >
                  <Text style={[
                    styles.modalButtonText,
                    button.style === 'cancel' && styles.modalButtonTextCancel,
                  ]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Helper function to get subject colors
const getSubjectColor = (subject) => {
  switch (subject.toLowerCase()) {
    case 'math': return '#3f51b5';
    case 'coding': return '#00796b';
    case 'writing': return '#d84315';
    case 'design': return '#6a1b9a';
    case 'language': return '#00838f';
    case 'chemistry': return '#f57f17';
    case 'physics': return '#1976d2';
    case 'business': return '#388e3c';
    case 'psychology': return '#7b1fa2';
    case 'statistics': return '#c62828';
    default: return '#9e9e9e';
  }
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
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
  errorButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  titleSection: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  titleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    lineHeight: 28,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  subjectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2e7d32',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dueDateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  normalBadge: {
    backgroundColor: '#e8f5e8',
  },
  urgentBadge: {
    backgroundColor: '#fff3e0',
  },
  overdueBadge: {
    backgroundColor: '#ffebee',
  },
  dueDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  normalText: {
    color: '#4caf50',
  },
  urgentText: {
    color: '#ff9800',
  },
  overdueText: {
    color: '#f44336',
  },
  progressSection: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  peopleSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
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
    marginBottom: 12,
  },
  personCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
  },
  personHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  personRole: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#ff9800',
    fontWeight: '600',
  },
  completedTasks: {
    fontSize: 11,
    color: '#666',
  },
  personName: {
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },
  descriptionSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  requirementsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  requirementItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  requirementBullet: {
    fontSize: 16,
    color: '#2e7d32',
    marginRight: 8,
    fontWeight: 'bold',
    marginTop: 2,
  },
  requirementText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    lineHeight: 20,
  },
  attachmentsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  deliverablesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  deliverableItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
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
    color: '#111',
    fontWeight: '500',
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  downloadIcon: {
    fontSize: 16,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    minWidth: 100,
  },
  infoValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  noteCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  feedbackCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e65100',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingStars: {
    fontSize: 16,
    marginRight: 6,
  },
  ratingNumber: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 100,
  },
  actionButtonsContainer: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  approveButton: { backgroundColor: '#4caf50' },
  disputeButton: { backgroundColor: '#ff5722' },
  cancelButton: { backgroundColor: '#f44336' },
  editButton: { backgroundColor: '#ff9800' },
  uploadButton: { backgroundColor: '#2e7d32' },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    marginBottom: 24,
    textAlign: 'center',
  },
  modalLoading: {
    alignItems: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  modalButtonCancel: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonPrimary: {
    backgroundColor: '#2e7d32',
  },
  modalButtonDestructive: {
    backgroundColor: '#f44336',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalButtonTextCancel: {
    color: '#666',
  },
});

export default TaskDetailsScreen;