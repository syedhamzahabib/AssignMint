import React, { useState, useMemo } from 'react';
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
} from 'react-native';

// Task Card Component
const TaskCard = ({ title, subject, price, deadline }) => {
  const getTagColor = (subject) => {
    switch (subject.toLowerCase()) {
      case 'math': return '#3f51b5';
      case 'coding': return '#00796b';
      case 'writing': return '#d84315';
      case 'design': return '#6a1b9a';
      case 'language': return '#00838f';
      case 'physics': return '#1976d2';
      case 'chemistry': return '#f57f17';
      case 'business': return '#388e3c';
      default: return '#9e9e9e';
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.tag, { backgroundColor: getTagColor(subject) }]}>
          <Text style={styles.tagText}>{subject}</Text>
        </View>
      </View>
      <Text style={styles.meta}>Deadline: {deadline}</Text>
      <Text style={styles.price}>{price}</Text>
    </View>
  );
};

// Sample tasks data
const dummyTasks = [
  {
    id: '1',
    title: 'Solve 10 Calculus Problems',
    subject: 'Math',
    price: '$20',
    deadline: 'May 25, 11:59 PM',
  },
  {
    id: '2',
    title: 'Fix bugs in Python script',
    subject: 'Coding',
    price: '$30',
    deadline: 'May 22, 10:00 PM',
  },
  {
    id: '3',
    title: 'Write 500-word essay on Civil War',
    subject: 'Writing',
    price: '$15',
    deadline: 'May 24, 8:00 PM',
  },
  {
    id: '4',
    title: 'Design a logo for student group',
    subject: 'Design',
    price: '$18',
    deadline: 'May 26, 6:00 PM',
  },
  {
    id: '5',
    title: 'Translate English to Spanish document',
    subject: 'Language',
    price: '$22',
    deadline: 'May 27, 3:00 PM',
  },
  {
    id: '6',
    title: 'Build basic website in HTML/CSS',
    subject: 'Coding',
    price: '$40',
    deadline: 'May 28, 9:00 PM',
  },
  {
    id: '7',
    title: 'Physics homework problems',
    subject: 'Physics',
    price: '$25',
    deadline: 'May 29, 8:00 PM',
  },
  {
    id: '8',
    title: 'Chemistry lab report',
    subject: 'Chemistry',
    price: '$28',
    deadline: 'May 30, 6:00 PM',
  },
  {
    id: '9',
    title: 'Business plan review',
    subject: 'Business',
    price: '$35',
    deadline: 'June 1, 10:00 AM',
  },
];

// Extended subject categories for filtering
const SUBJECTS = [
  { id: 'math', label: '📊 Math', value: 'Math' },
  { id: 'coding', label: '💻 Coding', value: 'Coding' },
  { id: 'writing', label: '✍️ Writing', value: 'Writing' },
  { id: 'design', label: '🎨 Design', value: 'Design' },
  { id: 'language', label: '🌍 Language', value: 'Language' },
  { id: 'physics', label: '⚛️ Physics', value: 'Physics' },
  { id: 'chemistry', label: '🧪 Chemistry', value: 'Chemistry' },
  { id: 'biology', label: '🧬 Biology', value: 'Biology' },
  { id: 'history', label: '🏛️ History', value: 'History' },
  { id: 'business', label: '💼 Business', value: 'Business' },
  { id: 'psychology', label: '🧠 Psychology', value: 'Psychology' },
  { id: 'statistics', label: '📈 Statistics', value: 'Statistics' },
  { id: 'philosophy', label: '🤔 Philosophy', value: 'Philosophy' },
  { id: 'engineering', label: '⚙️ Engineering', value: 'Engineering' },
];

const HomeScreen = () => {
  // State management for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]); // Multi-select subjects
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');

  // Filter subjects based on search query in the modal
  const filteredSubjects = useMemo(() => {
    if (!subjectSearchQuery.trim()) return SUBJECTS;
    
    const query = subjectSearchQuery.toLowerCase();
    return SUBJECTS.filter(subject => 
      subject.label.toLowerCase().includes(query) ||
      subject.value.toLowerCase().includes(query)
    );
  }, [subjectSearchQuery]);

  // Main filtering logic for tasks
  const filteredTasks = useMemo(() => {
    let filtered = [...dummyTasks];

    // Apply search filter - searches through title and subject
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(query) ||
        task.subject.toLowerCase().includes(query)
      );
    }

    // Apply subject filter (if any subjects selected)
    if (selectedSubjects.length > 0) {
      const selectedSubjectValues = selectedSubjects.map(id => {
        const subject = SUBJECTS.find(s => s.id === id);
        return subject ? subject.value.toLowerCase() : '';
      }).filter(Boolean);

      filtered = filtered.filter(task => 
        selectedSubjectValues.includes(task.subject.toLowerCase())
      );
    }

    return filtered;
  }, [searchQuery, selectedSubjects]);

  // Toggle subject selection (multi-select)
  const toggleSubjectSelection = (subjectId) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectId)) {
        // Remove if already selected
        return prev.filter(id => id !== subjectId);
      } else {
        // Add if not selected
        return [...prev, subjectId];
      }
    });
  };

  // Remove specific subject from selection
  const removeSubject = (subjectId) => {
    setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedSubjects([]);
  };

  // Clear only subject filters
  const clearSubjectFilters = () => {
    setSelectedSubjects([]);
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery.trim() || selectedSubjects.length > 0;

  // Get selected subjects data for display
  const getSelectedSubjectsData = () => {
    return selectedSubjects.map(id => SUBJECTS.find(s => s.id === id)).filter(Boolean);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>📋 Latest Tasks</Text>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.resultCount}>
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      {/* Search Bar with Filter Icon */}
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
          
          {/* Filter Icon Button */}
          <TouchableOpacity
            onPress={() => setShowSubjectModal(true)}
            style={[
              styles.filterIconButton,
              selectedSubjects.length > 0 && styles.filterIconButtonActive
            ]}
          >
            <Text style={[
              styles.filterIcon,
              selectedSubjects.length > 0 && styles.filterIconActive
            ]}>
              ⚙️
            </Text>
            {selectedSubjects.length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{selectedSubjects.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Filters Display (Chips) */}
      {selectedSubjects.length > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeFiltersContent}
          >
            {getSelectedSubjectsData().map((subject) => (
              <View key={subject.id} style={styles.filterChip}>
                <Text style={styles.filterChipText}>{subject.label}</Text>
                <TouchableOpacity
                  onPress={() => removeSubject(subject.id)}
                  style={styles.filterChipRemove}
                >
                  <Text style={styles.filterChipRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            
            {/* Clear all subjects button */}
            <TouchableOpacity 
              onPress={clearSubjectFilters}
              style={styles.clearFiltersChip}
            >
              <Text style={styles.clearFiltersChipText}>Clear All</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TaskCard {...item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No tasks found</Text>
            <Text style={styles.emptyText}>
              {hasActiveFilters 
                ? 'Try adjusting your search or filters'
                : 'No tasks available at the moment'
              }
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity onPress={clearAllFilters} style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSubjectModal(false)}
        >
          <Pressable style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Subjects</Text>
              <View style={styles.modalHeaderRight}>
                <Text style={styles.selectedCountText}>
                  {selectedSubjects.length} selected
                </Text>
                <TouchableOpacity
                  onPress={() => setShowSubjectModal(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCloseText}>Done</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={clearSubjectFilters}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              {/* Search Bar in Modal */}
              <View style={styles.modalSearchBar}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder="Search subjects..."
                  placeholderTextColor="#999"
                  value={subjectSearchQuery}
                  onChangeText={setSubjectSearchQuery}
                />
                {subjectSearchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSubjectSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    <Text style={styles.clearSearchText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Subject List */}
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {filteredSubjects.map((subject) => {
                const isSelected = selectedSubjects.includes(subject.id);
                return (
                  <TouchableOpacity
                    key={subject.id}
                    style={[
                      styles.modalItem,
                      isSelected && styles.modalItemSelected
                    ]}
                    onPress={() => toggleSubjectSelection(subject.id)}
                  >
                    {/* Checkbox */}
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Text style={styles.checkboxCheck}>✓</Text>
                      )}
                    </View>
                    
                    <Text style={[
                      styles.modalItemText,
                      isSelected && styles.modalItemTextSelected
                    ]}>
                      {subject.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              
              {filteredSubjects.length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No subjects found</Text>
                  <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                </View>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchBar: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
  filterIconButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
    position: 'relative',
  },
  filterIconButtonActive: {
    backgroundColor: '#f8fff8',
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
  activeFiltersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  clearFiltersChip: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearFiltersChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
    flexShrink: 1,
  },
  meta: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 8,
  },
  tag: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  modalHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCountText: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
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
  modalActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  clearAllButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  clearAllButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  modalSearchBar: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    paddingVertical: 10,
  },
  modalList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderRadius: 8,
    marginVertical: 2,
  },
  modalItemSelected: {
    backgroundColor: '#f8fff8',
    borderBottomColor: '#e8f5e8',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  checkboxCheck: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  modalItemTextSelected: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#666',
  },
});

export default HomeScreen;