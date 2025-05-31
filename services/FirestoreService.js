// services/FirestoreService.js
// Main Firestore service for manual matching system

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  runTransaction,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase'; // You'll need to create this

class FirestoreService {
  
  // ==================== TASKS COLLECTION ====================
  
  /**
   * Create a new task in Firestore
   */
  async createTask(taskData) {
    try {
      console.log('📝 Creating task in Firestore:', taskData.title);
      
      const taskDoc = {
        // Basic task info
        title: taskData.title,
        description: taskData.description,
        subject: taskData.subject,
        price: parseFloat(taskData.price.replace('$', '')),
        deadline: Timestamp.fromDate(new Date(taskData.deadline)),
        
        // Assignment settings
        autoMatch: taskData.matchingType === 'auto',
        manualMatch: taskData.matchingType === 'manual',
        
        // Status and assignment
        status: 'awaiting_expert',
        assignedExpertId: null,
        assignedAt: null,
        
        // Requester info
        requesterId: taskData.requesterId || 'user123', // Replace with actual user ID
        requesterName: taskData.requesterName || 'Current User',
        
        // AI settings
        aiLevel: taskData.aiLevel || 'none',
        aiPercentage: taskData.aiPercentage || 0,
        
        // Additional fields
        urgency: taskData.urgency || 'medium',
        estimatedHours: taskData.estimatedHours || null,
        specialInstructions: taskData.specialInstructions || '',
        tags: taskData.tags || [],
        
        // File attachments (store as URLs or file references)
        attachments: taskData.attachments || [],
        
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Statistics
        viewCount: 0,
        applicantCount: 0,
        
        // Manual match specific
        maxExperts: 1, // For now, only one expert per task
        expertApplications: [], // Array of expert IDs who applied
      };
      
      const docRef = await addDoc(collection(db, 'tasks'), taskDoc);
      console.log('✅ Task created with ID:', docRef.id);
      
      return {
        success: true,
        taskId: docRef.id,
        message: 'Task posted successfully!'
      };
    } catch (error) {
      console.error('❌ Error creating task:', error);
      throw {
        success: false,
        error: 'Create Failed',
        message: 'Failed to post task. Please try again.'
      };
    }
  }

  /**
   * Get all manual match tasks for the public feed
   */
  async getManualMatchTasks(filters = {}) {
    try {
      console.log('📡 Loading manual match tasks from Firestore...');
      
      let q = query(
        collection(db, 'tasks'),
        where('manualMatch', '==', true),
        where('status', '==', 'awaiting_expert'),
        orderBy('createdAt', 'desc')
      );
      
      // Apply additional filters
      if (filters.subject && filters.subject !== 'all') {
        q = query(q, where('subject', '==', filters.subject));
      }
      
      if (filters.maxPrice) {
        q = query(q, where('price', '<=', parseFloat(filters.maxPrice)));
      }
      
      if (filters.urgency && filters.urgency !== 'all') {
        q = query(q, where('urgency', '==', filters.urgency));
      }
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          deadline: data.deadline?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
          assignedAt: data.assignedAt?.toDate().toISOString(),
          // Format price for display
          price: `$${data.price}`,
        });
      });
      
      console.log(`✅ Loaded ${tasks.length} manual match tasks`);
      
      return {
        success: true,
        data: tasks,
        total: tasks.length
      };
    } catch (error) {
      console.error('❌ Error loading manual match tasks:', error);
      throw {
        success: false,
        error: 'Load Failed',
        message: 'Failed to load available tasks.'
      };
    }
  }

  /**
   * Accept/claim a task (with transaction to prevent race conditions)
   */
  async acceptTask(taskId, expertId, expertName) {
    try {
      console.log(`🎯 Expert ${expertName} attempting to accept task ${taskId}`);
      
      const result = await runTransaction(db, async (transaction) => {
        const taskRef = doc(db, 'tasks', taskId);
        const taskDoc = await transaction.get(taskRef);
        
        if (!taskDoc.exists()) {
          throw new Error('Task not found');
        }
        
        const taskData = taskDoc.data();
        
        // Check if task is still available
        if (taskData.status !== 'awaiting_expert') {
          throw new Error('Task is no longer available');
        }
        
        if (taskData.assignedExpertId) {
          throw new Error('Task has already been assigned to another expert');
        }
        
        // Check if expert already applied (optional business logic)
        if (taskData.expertApplications?.includes(expertId)) {
          throw new Error('You have already applied for this task');
        }
        
        // Update task with expert assignment
        transaction.update(taskRef, {
          status: 'in_progress',
          assignedExpertId: expertId,
          assignedExpertName: expertName,
          assignedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          // Clear applications since task is now assigned
          expertApplications: [],
        });
        
        return {
          success: true,
          taskId,
          expertId,
          expertName,
          taskTitle: taskData.title,
          requesterId: taskData.requesterId
        };
      });
      
      console.log('✅ Task accepted successfully');
      
      // Create notification for requester (optional)
      await this.createNotification({
        userId: result.requesterId,
        type: 'task_accepted',
        title: 'Expert Assigned!',
        message: `${result.expertName} has accepted your task "${result.taskTitle}"`,
        taskId: result.taskId,
        metadata: {
          expertId: result.expertId,
          expertName: result.expertName
        }
      });
      
      return {
        success: true,
        message: `Successfully accepted "${result.taskTitle}"!`,
        data: result
      };
      
    } catch (error) {
      console.error('❌ Error accepting task:', error);
      
      let message = 'Failed to accept task. Please try again.';
      if (error.message.includes('already been assigned')) {
        message = 'Sorry! Another expert just accepted this task.';
      } else if (error.message.includes('no longer available')) {
        message = 'This task is no longer available.';
      } else if (error.message.includes('already applied')) {
        message = 'You have already applied for this task.';
      }
      
      throw {
        success: false,
        error: 'Accept Failed',
        message
      };
    }
  }

  /**
   * Get tasks by user role (requester or expert)
   */
  async getTasksByUser(userId, role) {
    try {
      console.log(`📡 Loading ${role} tasks for user ${userId}`);
      
      let q;
      if (role === 'requester') {
        q = query(
          collection(db, 'tasks'),
          where('requesterId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Expert tasks
        q = query(
          collection(db, 'tasks'),
          where('assignedExpertId', '==', userId),
          orderBy('assignedAt', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      const tasks = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        tasks.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps
          deadline: data.deadline?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
          assignedAt: data.assignedAt?.toDate().toISOString(),
          // Format price
          price: `$${data.price}`,
        });
      });
      
      console.log(`✅ Loaded ${tasks.length} ${role} tasks`);
      
      return {
        success: true,
        data: tasks,
        total: tasks.length
      };
    } catch (error) {
      console.error(`❌ Error loading ${role} tasks:`, error);
      throw {
        success: false,
        error: 'Load Failed',
        message: `Failed to load your ${role} tasks.`
      };
    }
  }

  /**
   * Update task status and metadata
   */
  async updateTaskStatus(taskId, status, additionalData = {}) {
    try {
      console.log(`📝 Updating task ${taskId} status to ${status}`);
      
      const taskRef = doc(db, 'tasks', taskId);
      const updateData = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      };
      
      await updateDoc(taskRef, updateData);
      
      console.log('✅ Task status updated successfully');
      
      return {
        success: true,
        message: 'Task updated successfully'
      };
    } catch (error) {
      console.error('❌ Error updating task status:', error);
      throw {
        success: false,
        error: 'Update Failed',
        message: 'Failed to update task.'
      };
    }
  }

  // ==================== NOTIFICATIONS ====================
  
  /**
   * Create a notification
   */
  async createNotification(notificationData) {
    try {
      const notificationDoc = {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        taskId: notificationData.taskId || null,
        metadata: notificationData.metadata || {},
        isRead: false,
        createdAt: serverTimestamp(),
      };
      
      await addDoc(collection(db, 'notifications'), notificationDoc);
      console.log('✅ Notification created');
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      // Don't throw - notifications are non-critical
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId, limit = 20) {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate().toISOString(),
        });
      });
      
      return {
        success: true,
        data: notifications
      };
    } catch (error) {
      console.error('❌ Error loading notifications:', error);
      return {
        success: false,
        data: []
      };
    }
  }

  // ==================== REAL-TIME LISTENERS ====================
  
  /**
   * Listen to manual match tasks in real-time
   */
  subscribeToManualMatchTasks(callback, filters = {}) {
    try {
      let q = query(
        collection(db, 'tasks'),
        where('manualMatch', '==', true),
        where('status', '==', 'awaiting_expert'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            ...data,
            deadline: data.deadline?.toDate().toISOString(),
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString(),
            price: `$${data.price}`,
          });
        });
        
        callback({
          success: true,
          data: tasks,
          total: tasks.length
        });
      }, (error) => {
        console.error('❌ Error in tasks subscription:', error);
        callback({
          success: false,
          error: 'Subscription Failed',
          message: 'Failed to get real-time updates.'
        });
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up tasks subscription:', error);
      return null;
    }
  }

  /**
   * Listen to user's tasks in real-time
   */
  subscribeToUserTasks(userId, role, callback) {
    try {
      let q;
      if (role === 'requester') {
        q = query(
          collection(db, 'tasks'),
          where('requesterId', '==', userId),
          orderBy('createdAt', 'desc')
        );
      } else {
        q = query(
          collection(db, 'tasks'),
          where('assignedExpertId', '==', userId),
          orderBy('assignedAt', 'desc')
        );
      }
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const tasks = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          tasks.push({
            id: doc.id,
            ...data,
            deadline: data.deadline?.toDate().toISOString(),
            createdAt: data.createdAt?.toDate().toISOString(),
            updatedAt: data.updatedAt?.toDate().toISOString(),
            assignedAt: data.assignedAt?.toDate().toISOString(),
            price: `$${data.price}`,
          });
        });
        
        callback({
          success: true,
          data: tasks,
          total: tasks.length
        });
      }, (error) => {
        console.error(`❌ Error in ${role} tasks subscription:`, error);
        callback({
          success: false,
          error: 'Subscription Failed',
          message: `Failed to get real-time updates for ${role} tasks.`
        });
      });
      
      return unsubscribe;
    } catch (error) {
      console.error(`❌ Error setting up ${role} tasks subscription:`, error);
      return null;
    }
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Get a single task by ID
   */
  async getTaskById(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }
      
      const data = taskDoc.data();
      return {
        success: true,
        data: {
          id: taskDoc.id,
          ...data,
          deadline: data.deadline?.toDate().toISOString(),
          createdAt: data.createdAt?.toDate().toISOString(),
          updatedAt: data.updatedAt?.toDate().toISOString(),
          assignedAt: data.assignedAt?.toDate().toISOString(),
          price: `$${data.price}`,
        }
      };
    } catch (error) {
      console.error('❌ Error getting task by ID:', error);
      throw {
        success: false,
        error: 'Task Not Found',
        message: 'The requested task could not be found.'
      };
    }
  }

  /**
   * Increment task view count
   */
  async incrementTaskViews(taskId) {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await runTransaction(db, async (transaction) => {
        const taskDoc = await transaction.get(taskRef);
        if (taskDoc.exists()) {
          const newViewCount = (taskDoc.data().viewCount || 0) + 1;
          transaction.update(taskRef, { 
            viewCount: newViewCount,
            updatedAt: serverTimestamp()
          });
        }
      });
    } catch (error) {
      console.log('❌ Error incrementing task views:', error);
      // Non-critical, don't throw
    }
  }
}

// Export singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;