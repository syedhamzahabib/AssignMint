import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';

const specialInstructionsTemplates = [
  { id: 'mla', label: '📝 MLA Format', value: 'Follow MLA formatting guidelines' },
  { id: 'apa', label: '📝 APA Format', value: 'Follow APA formatting guidelines' },
  { id: 'chicago', label: '📝 Chicago Style', value: 'Follow Chicago style guidelines' },
  { id: 'steps', label: '📋 Show Work/Steps', value: 'Please show all work and steps clearly' },
  { id: 'plagiarism', label: '🔍 Plagiarism Free', value: 'Must be 100% original, no plagiarism' },
  { id: 'citations', label: '📚 Include Citations', value: 'Include proper citations and references' },
  { id: 'custom', label: '✍️ Custom Instructions', value: '' },
];

const StepFour = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Generate date options (next 7 days)
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      };
      
      dates.push({
        id: i,
        label: date.toLocaleDateString('en-US', options),
        value: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: 'numeric'
        }),
        fullDate: date,
      });
    }
    return dates;
  };

  const timeOptions = [
    { id: '1', label: '9:00 AM', value: '9:00 AM' },
    { id: '2', label: '12:00 PM', value: '12:00 PM' },
    { id: '3', label: '3:00 PM', value: '3:00 PM' },
    { id: '4', label: '6:00 PM', value: '6:00 PM' },
    { id: '5', label: '9:00 PM', value: '9:00 PM' },
    { id: '6', label: '11:59 PM', value: '11:59 PM' },
  ];

  const dateOptions = generateDateOptions();

  const selectDateTime = (date, time) => {
    const deadline = `${date} at ${time}`;
    updateFormData('deadline', deadline);
    setSelectedDate(date);
    setSelectedTime(time);
    setShowDatePicker(false);
  };

  const selectInstructionTemplate = (template) => {
    if (template.id === 'custom') {
      updateFormData('specialInstructions', '');
    } else {
      updateFormData('specialInstructions', template.value);
    }
    setShowInstructionsModal(false);
  };

  const toggleMatchingType = (type) => {
    updateFormData('matchingType', type);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Task (4/4)</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.form}>
        {/* Deadline Section */}
        <Text style={styles.label}>⏰ Choose Deadline</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateIcon}>📅</Text>
          <Text style={[
            styles.dateText,
            formData.deadline ? styles.selectedText : styles.placeholderText
          ]}>
            {formData.deadline || 'Select Date & Time'}
          </Text>
        </TouchableOpacity>

        {/* Budget Section */}
        <Text style={styles.label}>💰 Your Budget</Text>
        <View style={styles.budgetContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.budgetInput}
            placeholder="40"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={formData.budget}
            onChangeText={(text) => updateFormData('budget', text.replace(/[^0-9]/g, ''))}
          />
        </View>

        {/* Special Instructions Section */}
        <Text style={styles.label}>📑 Special Instructions</Text>
        <TouchableOpacity
          style={styles.instructionsButton}
          onPress={() => setShowInstructionsModal(true)}
        >
          <Text style={styles.instructionsText}>+ Add quick template ▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.instructionsInput}
          placeholder="Add any special requirements..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={formData.specialInstructions}
          onChangeText={(text) => updateFormData('specialInstructions', text)}
        />

        {/* Matching Preferences */}
        <Text style={styles.label}>🎯 Matching Preference</Text>
        <View style={styles.matchingContainer}>
          <TouchableOpacity
            style={[
              styles.matchingOption,
              formData.matchingType === 'auto' && styles.selectedMatching,
            ]}
            onPress={() => toggleMatchingType('auto')}
          >
            <Text style={styles.matchingIcon}>⚡</Text>
            <Text style={[
              styles.matchingText,
              formData.matchingType === 'auto' && styles.selectedMatchingText,
            ]}>
              Auto-match
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.matchingOption,
              formData.matchingType === 'manual' && styles.selectedMatching,
            ]}
            onPress={() => toggleMatchingType('manual')}
          >
            <Text style={styles.matchingIcon}>👀</Text>
            <Text style={[
              styles.matchingText,
              formData.matchingType === 'manual' && styles.selectedMatchingText,
            ]}>
              Review
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Review & Pay Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.reviewButton} onPress={onNext}>
          <Text style={styles.reviewButtonText}>Review & Pay</Text>
        </TouchableOpacity>
      </View>

      {/* Date/Time Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Deadline</Text>
            
            <Text style={styles.sectionTitle}>Date</Text>
            <FlatList
              data={dateOptions}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedDate === item.value && styles.selectedModalItem,
                  ]}
                  onPress={() => setSelectedDate(item.value)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedDate === item.value && styles.selectedModalText,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />

            <Text style={styles.sectionTitle}>Time</Text>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    selectedTime === item.value && styles.selectedModalItem,
                  ]}
                  onPress={() => setSelectedTime(item.value)}
                >
                  <Text style={[
                    styles.modalItemText,
                    selectedTime === item.value && styles.selectedModalText,
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
            />

            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!selectedDate || !selectedTime) && styles.disabledButton,
              ]}
              onPress={() => selectDateTime(selectedDate, selectedTime)}
              disabled={!selectedDate || !selectedTime}
            >
              <Text style={styles.confirmButtonText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Instructions Template Modal */}
      <Modal
        visible={showInstructionsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInstructionsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowInstructionsModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Quick Templates</Text>
            <FlatList
              data={specialInstructionsTemplates}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.templateItem}
                  onPress={() => selectInstructionTemplate(item)}
                >
                  <Text style={styles.templateText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
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
  form: {
    flex: 1,
    paddingTop: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  dateButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  dateIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    fontSize: 16,
  },
  selectedText: {
    color: '#111',
    fontWeight: '500',
  },
  placeholderText: {
    color: '#999',
  },
  budgetContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2e7d32',
    marginRight: 8,
  },
  budgetInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: '#111',
  },
  instructionsButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  instructionsInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
    color: '#111',
    marginBottom: 24,
  },
  matchingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  matchingOption: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e5e5',
  },
  selectedMatching: {
    borderColor: '#2e7d32',
    backgroundColor: '#f8fff8',
  },
  matchingIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  matchingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  selectedMatchingText: {
    color: '#2e7d32',
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginTop: 16,
  },
  modalItem: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedModalItem: {
    backgroundColor: '#f8fff8',
    borderColor: '#2e7d32',
  },
  modalItemText: {
    fontSize: 14,
    color: '#333',
  },
  selectedModalText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  templateItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  templateText: {
    fontSize: 16,
    color: '#333',
  },
});

export default StepFour;
