<<<<<<< HEAD
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const StepFour = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const setQuickDeadline = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const deadline = `${date.toDateString()} at 11:59 PM`;
    updateFormData('deadline', deadline);
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
        <Text style={styles.headerTitle}>Post Task (4/5)</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.form}>
        {/* Quick Deadline Selection */}
        <Text style={styles.label}>⏰ Set Deadline</Text>
        <Text style={styles.currentDeadline}>
          Current: {formData.deadline || 'Not set'}
        </Text>
        
        <View style={styles.quickButtons}>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(1)}
          >
            <Text style={styles.quickButtonText}>Tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(3)}
          >
            <Text style={styles.quickButtonText}>3 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(7)}
          >
            <Text style={styles.quickButtonText}>1 Week</Text>
          </TouchableOpacity>
        </View>

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

        {/* Special Instructions */}
        <Text style={styles.label}>📑 Special Instructions (Optional)</Text>
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

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Review & Pay →</Text>
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
  currentDeadline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
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
  instructionsInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
  nextButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StepFour;
=======
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const StepFour = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const setQuickDeadline = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const deadline = `${date.toDateString()} at 11:59 PM`;
    updateFormData('deadline', deadline);
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
        <Text style={styles.headerTitle}>Post Task (4/5)</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.form}>
        {/* Quick Deadline Selection */}
        <Text style={styles.label}>⏰ Set Deadline</Text>
        <Text style={styles.currentDeadline}>
          Current: {formData.deadline || 'Not set'}
        </Text>
        
        <View style={styles.quickButtons}>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(1)}
          >
            <Text style={styles.quickButtonText}>Tomorrow</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(3)}
          >
            <Text style={styles.quickButtonText}>3 Days</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickButton} 
            onPress={() => setQuickDeadline(7)}
          >
            <Text style={styles.quickButtonText}>1 Week</Text>
          </TouchableOpacity>
        </View>

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

        {/* Special Instructions */}
        <Text style={styles.label}>📑 Special Instructions (Optional)</Text>
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

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Review & Pay →</Text>
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
  currentDeadline: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  quickButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  quickButtonText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
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
  instructionsInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
  nextButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StepFour;
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
