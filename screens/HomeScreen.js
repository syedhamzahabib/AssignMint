// screens/HomeScreen.js - Enhanced with Manual Matching
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

// Import services
import firestoreService from '../services/FirestoreService';
import { useAppState } from '../services/AppStateManager';

// Import components
import ManualMatchTaskCard from '../components/task/ManualMatchTaskCard';
import LoadingScreen from '../components/common/LoadingScreen';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Constants
const SUBJECTS = [
  { id: 'math', label: '📊 Math', value: 'Math' },
  { id: 'coding', label: '💻 Coding', value: 'Coding' },
  { id: 'writing', label: '✍️ Writing', value: 'Writing' },
  { id: 'design', label: '🎨 Design', value: 'Design' },
  { id: 'language', label: '🌍 Language', value: 'Language' },
  { id: 'science', label: '🔬 Science', value: 'Science' },
  { id: 'business', label: '💼 Business', value: 'Business' },
  { id: 'other', label: '📋 Other', value: 'Other' },
];

const URGENCY_LEVELS = [
  { id: 'high', label: '🔥 High Priority', value: 'high' },
  { id: 'medium', label: '⚡ Medium Priority', value: 'medium' },
  { id: 'low', label: '🌱 Low Priority', value: 'low' },
];

const HomeScreen = ({ navigation }) => {
  // State management
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [acceptingTask, setAcceptingTask] = useState(null);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Real-time subscription
  const [unsubscribe, setUnsubscribe] = useState(null);
  
  // App state
  const { userRole } = useAppState();
  
  // Load manual match tasks
  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        subject: selectedSubjects.length === 1 ? selectedSubjects[0] : 'all',
        urgency: selectedUrgency,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      };
      
      const response = await firestoreService.getManualMatchTasks(filters);
      
      if (response.success) {
        setTasks(response.data);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setError(error.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [selectedSubjects, selectedUrgency, maxPrice]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up real-time task subscription...');
    
    const subscription = firestoreService.subscribeToManualMatchTasks((response) => {
      if (response.success) {
        setTasks(response.data);
        setError(null);
      } else {
        setError(response.message || 'Failed to get real-time updates');
      }
      setLoading(false);
    });
    
    setUnsubscribe(() => subscription);
    
    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log('🔄 Cleaning up task subscription');
        subscription();
      }
    };
  }, []);

  // Refresh tasks
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  // Handle task acceptance
  const handleAcceptTask = useCallback(async (task) => {
    try {
      setAcceptingTask(task.id);
      
      // Show confirmation dialog
      Alert.alert(
        '🎯 Accept Task',
        `Do you want to accept "${task.title}"?\n\nPrice: ${task.price}\nDeadline: ${new Date(task.deadline).toLocaleDateString()}\n\n⚠️ Once accepted, you'll be responsible for completing this task.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setAcceptingTask(null)
          },
          {
            text: 'Accept Task',
            style: 'default',
            onPress: async () => {
              try {
                // Replace with actual expert ID and name from auth
                const expertId = 'expert123'; // Get from auth context
                const expertName = 'Current Expert'; // Get from user profile
                
                const response = await firestoreService.acceptTask(
                  task.id, 
                  expertId, 
                  expertName
                );
                
                if (response.success) {
                  Alert.alert(
                    '🎉 Task Accepted!',
                    response.message,
                    [
                      {
                        text: 'View My Tasks',
                        onPress: () => navigation?.navigate('MyTasks')
                      },
                      {
                        text: 'Continue Browsing',
                        style: 'cancel'
                      }
                    ]
                  );
                }
              } catch (acceptError) {
                Alert.alert(
                  '❌ Accept Failed',
                  acceptError.message || 'Failed to accept task. Please try again.',
                  [{ text: 'OK' }]
                );
              } finally {
                setAcceptingTask(null);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error in accept task handler:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setAcceptingTask(null);
    }
  }, [navigation]);

  // Handle task details view
  const handleViewTask = useCallback((task) => {
    // Increment view count
    firestoreService.incrementTaskViews(task.id);
    
    // Navigate to task details
    if (navigation) {
      navigation.navigate('TaskDetails', {
        taskId: task.id,
        role: 'expert',
        task: task
      });
    }
  }, [navigation]);

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
      );
    }

    // Apply subject filter (client-side for real-time updates)
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(task => 
        selectedSubjects.includes(task.subject.toLowerCase())
      );
    }

    // Apply urgency filter (client-side)
    if (selectedUrgency !== 'all') {
      filtered = filtered.filter(task => task.urgency === selectedUrgency);
    }

    // Apply price filter (client-side)
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      filtered = filtered.filter(task => {
        const taskPrice = parseFloat(task.price.replace('$', ''));
        return taskPrice <= maxPriceNum;
      });
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return filtered;
  }, [tasks, searchQuery, selectedSubjects, selectedUrgency, maxPrice]);

  // Toggle subject selection
  const toggleSubjectSelection = useCallback((subjectValue) => {
    setSelectedSubjects(prev => {
      const lowercaseValue = subjectValue.toLowerCase();
      if (prev.includes(lowercaseValue)) {
        return prev.filter(s => s !== lowercaseValue);
      } else {
        return [...prev, lowercaseValue];
      }
    });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedSubjects([]);
    setSelectedUrgency('all');
    setMaxPrice('');
  }, []);

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedSubjects.length > 0 || selectedUrgency !== 'all' || maxPrice.trim();

  // Render task card
  const renderTaskCard = useCallback(({ item }) => (
    <ManualMatchTaskCard
      task={item}
      onAccept={handleAcceptTask}
      onViewDetails={handleViewTask}
      isAccepting={acceptingTask === item.id}
    />
  ), [handleAcceptTask, handleViewTask, acceptingTask]);

  // Show different content for requesters
  if (userRole === 'requester') {
    return (
      <View style={styles.container}>
        <View style={styles.roleMessageContainer}>
          <Text style={styles.roleMessageIcon}>👑</Text>
          <Text style={styles.roleMessageTitle}>Requester View</Text>
          <Text style={styles.roleMessageText}>
            As a requester, you don't see the task feed. Your posted tasks will appear in the "My Tasks" section.
          </Text>
          <TouchableOpacity 
            style={styles.roleMessageButton}
            onPress={() => navigation?.navigate('MyTasks')}
          >
            <Text style={styles.roleMessageButtonText}>View My Tasks</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Loading state
  if (loading && tasks.length === 0) {
    return (
      <LoadingScreen 
        message="Loading available tasks..." 
        submessage="Finding the perfect assignments for you"
      />
    );
  }

  // Error state
  if (error && tasks.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Failed to Load Tasks</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTasks}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>🎯 Available Tasks</Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.resultCount}>
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} available
            {tasks.length !== filteredTasks.length && ` (${tasks.length} total)`}
          </Text>
        </View>

        {/* Search and Filter Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.clearSearchButton}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
            
            {/* Filter Button */}
            <TouchableOpacity
              onPress={() => setShowFilterModal(true)}
              style={[
                styles.filterButton,
                hasActiveFilters && styles.filterButtonActive
              ]}
            >
              <Text style={[
                styles.filterIcon,
                hasActiveFilters && styles.filterIconActive
              ]}>
                ⚙️
              </Text>
              {hasActiveFilters && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {[selectedSubjects.length > 0, selectedUrgency !== 'all', maxPrice.trim()].filter(Boolean).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.activeFiltersContent}
            >
              {selectedSubjects.map((subject) => {
                const subjectData = SUBJECTS.find(s => s.value.toLowerCase() === subject);
                return (
                  <View key={subject} style={styles.filterChip}>
                    <Text style={styles.filterChipText}>
                      {subjectData?.label || subject}
                    </Text>
                    <TouchableOpacity
                      onPress={() => toggleSubjectSelection(subjectData?.value || subject)}
                      style={styles.filterChipRemove}
                    >
                      <Text style={styles.filterChipRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
              
              {selectedUrgency !== 'all' && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    {URGENCY_LEVELS.find(u => u.value === selectedUrgency)?.label || selectedUrgency}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setSelectedUrgency('all')}
                    style={styles.filterChipRemove}
                  >
                    <Text style={styles.filterChipRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {maxPrice.trim() && (
                <View style={styles.filterChip}>
                  <Text style={styles.filterChipText}>
                    Max ${maxPrice}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setMaxPrice('')}
                    style={styles.filterChipRemove}
                  >
                    <Text style={styles.filterChipRemoveText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        )}

        {/* Task List */}
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {hasActiveFilters ? '🔍' : '📭'}
            </Text>
            <Text style={styles.emptyTitle}>
              {hasActiveFilters ? 'No tasks match your filters' : 'No tasks available'}
            </Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters 
                ? 'Try adjusting your search criteria or check back later'
                : 'Check back soon for new assignment opportunities!'
              }
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredTasks}
            keyExtractor={(item) => item.id}
            renderItem={renderTaskCard}
            contentContainerStyle={styles.taskList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2e7d32']}
                tintColor="#2e7d32"
              />
            }
            ListHeaderComponent={
              <View style={styles.listHeader}>
                <Text style={styles.instructionText}>
                  💡 Pull down to refresh • Tap to view details • Accept to claim
                </Text>
              </View>
            }
          />
        )}

        {/* Filter Modal */}
        <Modal
          visible={showFilterModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowFilterModal(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowFilterModal(false)}
          >
            <Pressable style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filter Tasks</Text>
                <TouchableOpacity
                  onPress={() => setShowFilterModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Subjects Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>📚 Subjects</Text>
                  <View style={styles.subjectGrid}>
                    {SUBJECTS.map((subject) => {
                      const isSelected = selectedSubjects.includes(subject.value.toLowerCase());
                      return (
                        <TouchableOpacity
                          key={subject.id}
                          style={[
                            styles.subjectItem,
                            isSelected && styles.subjectItemSelected
                          ]}
                          onPress={() => toggleSubjectSelection(subject.value)}
                        >
                          <Text style={[
                            styles.subjectItemText,
                            isSelected && styles.subjectItemTextSelected
                          ]}>
                            {subject.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Urgency Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>⚡ Priority Level</Text>
                  <TouchableOpacity
                    style={[
                      styles.urgencyItem,
                      selectedUrgency === 'all' && styles.urgencyItemSelected
                    ]}
                    onPress={() => setSelectedUrgency('all')}
                  >
                    <Text style={[
                      styles.urgencyItemText,
                      selectedUrgency === 'all' && styles.urgencyItemTextSelected
                    ]}>
                      📋 All Priorities
                    </Text>
                  </TouchableOpacity>
                  
                  {URGENCY_LEVELS.map((urgency) => {
                    const isSelected = selectedUrgency === urgency.value;
                    return (
                      <TouchableOpacity
                        key={urgency.id}
                        style={[
                          styles.urgencyItem,
                          isSelected && styles.urgencyItemSelected
                        ]}
                        onPress={() => setSelectedUrgency(urgency.value)}
                      >
                        <Text style={[
                          styles.urgencyItemText,
                          isSelected && styles.urgencyItemTextSelected
                        ]}>
                          {urgency.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Price Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>💰 Maximum Price</Text>
                  <View style={styles.priceInputContainer}>
                    <Text style={styles.priceSymbol}>$</Text>
                    <TextInput
                      style={styles.priceInput}
                      placeholder="100"
                      placeholderTextColor="#999"
                      keyboardType="numeric"
                      value={maxPrice}
                      onChangeText={(text) => {
                        const cleanText = text.replace(/[^0-9.]/g, '');
                        setMaxPrice(cleanText);
                      }}
                      maxLength={6}
                    />
                  </View>
                  {maxPrice.trim() && (
                    <Text style={styles.priceHint}>
                      Show tasks up to ${maxPrice}
                    </Text>
                  )}
                </View>

                {/* Clear Filters Button */}
                <TouchableOpacity 
                  style={styles.clearFiltersButton}
                  onPress={clearAllFilters}
                >
                  <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Loading overlay for task acceptance */}
        {acceptingTask && (
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color="#2e7d32" />
              <Text style={styles.loadingText}>Accepting task...</Text>
            </View>
          </View>
        )}
      </View>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  
  // Role message for requesters
  roleMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  roleMessageIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  roleMessageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleMessageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: 320,
  },
  roleMessageButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  roleMessageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
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
    lineHeight: 22,
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
  
  // Header
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  clearButton: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  
  // Search and filter
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  searchBar: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    paddingVertical: 12,
  },
  clearSearchButton: {
    padding: 4,
    marginHorizontal: 4,
  },
  clearSearchText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#e8f5e8',
  },
  filterIcon: {
    fontSize: 18,
    color: '#666',
  },
  filterIconActive: {
    color: '#2e7d32',
  },
  filterBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#ff6b6b',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Active filters
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  activeFiltersContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e8',
    borderRadius: 20,
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  filterChipText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
    marginRight: 6,
  },
  filterChipRemove: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipRemoveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Task list
  listHeader: {
    paddingVertical: 8,
  },
  instructionText: {
    fontSize: 12,
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '500',
  },
  taskList: {
    paddingBottom: 20,
  },
  
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  modalCloseButton: {
    backgroundColor: '#2e7d32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalScrollView: {
    paddingHorizontal: 20,
  },
  
  // Filter sections
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  
  // Subject filter
  subjectGrid: {
    gap: 8,
  },
  subjectItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subjectItemSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  subjectItemText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  subjectItemTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  
  // Urgency filter
  urgencyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  urgencyItemSelected: {
    backgroundColor: '#e8f5e8',
    borderColor: '#2e7d32',
  },
  urgencyItemText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  urgencyItemTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  
  // Price filter
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2e7d32',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#111',
    fontWeight: '600',
  },
  priceHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Clear filters button
  clearFiltersButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  clearFiltersButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  
  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 16,
    fontWeight: '500',
  },
});

export default HomeScreen;