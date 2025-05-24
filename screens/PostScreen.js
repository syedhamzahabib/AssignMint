import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  Text,
  TouchableOpacity,
} from 'react-native';

import StepOne from './PostTaskSteps/StepOne';
import StepTwo from './PostTaskSteps/StepTwo';
import StepThree from './PostTaskSteps/StepThree';
import StepFour from './PostTaskSteps/StepFour';
import StepFive from './PostTaskSteps/StepFive';

const PostScreen = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    images: [],
    files: [],
    aiLevel: 'none',
    aiPercentage: 40,
    deadline: null,
    specialInstructions: '',
    matchingType: 'auto',
    budget: '',
    paymentMethod: null,
  });

  const updateFormData = (field, value) => {
    console.log('Updating form data:', field, '=', value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step) => {
    console.log('Validating step:', step, 'with data:', formData);
    
    switch (step) {
      case 1:
        if (!formData.subject || !formData.subject.trim()) {
          Alert.alert('Required Field', 'Please select a subject');
          return false;
        }
        if (!formData.title || !formData.title.trim()) {
          Alert.alert('Required Field', 'Please enter a task title');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.description || !formData.description.trim()) {
          Alert.alert('Required Field', 'Please enter a task description');
          return false;
        }
        if (formData.description.trim().length < 20) {
          Alert.alert('Description Too Short', 'Please provide at least 20 characters for a good description');
          return false;
        }
        return true;
        
      case 3:
        // AI level is always valid (has default)
        return true;
        
      case 4:
        if (!formData.deadline) {
          Alert.alert('Required Field', 'Please select a deadline');
          return false;
        }
        if (!formData.budget || !formData.budget.trim()) {
          Alert.alert('Required Field', 'Please enter your budget');
          return false;
        }
        const budgetNumber = parseFloat(formData.budget);
        if (isNaN(budgetNumber) || budgetNumber <= 0) {
          Alert.alert('Invalid Budget', 'Please enter a valid budget amount (greater than $0)');
          return false;
        }
        if (budgetNumber > 1000) {
          Alert.alert('Budget Too High', 'Maximum budget is $1000 per task');
          return false;
        }
        return true;
        
      case 5:
        if (!formData.paymentMethod) {
          Alert.alert('Required Field', 'Please select a payment method');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const resetForm = () => {
    console.log('Resetting form...');
    setFormData({
      subject: '',
      title: '',
      description: '',
      images: [],
      files: [],
      aiLevel: 'none',
      aiPercentage: 40,
      deadline: null,
      specialInstructions: '',
      matchingType: 'auto',
      budget: '',
      paymentMethod: null,
    });
    setCurrentStep(1);
  };

  const handleSubmit = () => {
    console.log('Final form submission:', formData);
    
    try {
      // Show success message with details
      const taskSummary = `Task: ${formData.title}
Subject: ${formData.subject}
Budget: ${formData.budget}
Due: ${formData.deadline}
AI Level: ${formData.aiLevel === 'none' ? 'Human only' : 
          formData.aiLevel === 'partial' ? `Partial AI (${formData.aiPercentage}%)` : 
          'Full AI'}`;

      Alert.alert(
        'Task Posted Successfully! 🎉',
        `${taskSummary}

Your task has been posted and will be visible to experts shortly. You'll receive notifications when experts apply.`,
        [
          {
            text: 'Post Another Task',
            onPress: resetForm,
          },
          {
            text: 'Done',
            style: 'default',
            onPress: resetForm,
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert(
        'Submission Error',
        'There was an error posting your task. Please check your information and try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Remove individual step navigation - let each step handle its own
  const renderProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>Step {currentStep} of 5</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStep / 5) * 100}%` }]} />
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    console.log('Rendering step:', currentStep);
    
    // Pass minimal props - let each step handle navigation internally
    const stepProps = {
      formData,
      updateFormData,
      onNext: () => {
        if (validateStep(currentStep)) {
          if (currentStep < 5) {
            setCurrentStep(prev => prev + 1);
          } else {
            handleSubmit();
          }
        }
      },
      onBack: () => {
        if (currentStep > 1) {
          setCurrentStep(prev => prev - 1);
        }
      },
      currentStep,
    };

    try {
      switch (currentStep) {
        case 1:
          return <StepOne {...stepProps} />;
        case 2:
          return <StepTwo {...stepProps} />;
        case 3:
          return <StepThree {...stepProps} />;
        case 4:
          return <StepFour {...stepProps} />;
        case 5:
          return <StepFive {...stepProps} />;
        default:
          return <StepOne {...stepProps} />;
      }
    } catch (error) {
      console.error('Error rendering step:', error);
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>⚠️ Error Loading Step</Text>
          <Text style={styles.errorText}>Step {currentStep} failed to load</Text>
          <Text style={styles.errorDetails}>{error.toString()}</Text>
          <TouchableOpacity 
            style={styles.errorButton}
            onPress={() => setCurrentStep(1)}
          >
            <Text style={styles.errorButtonText}>Go to Step 1</Text>
          </TouchableOpacity>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Indicator */}
      {renderProgressIndicator()}
      
      {/* Debug Info - Remove in production */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>🔧 Debug: Step {currentStep}</Text>
        <Text style={styles.debugText}>
          📝 {formData.subject || 'No subject'} • {formData.title || 'No title'}
        </Text>
        <Text style={styles.debugText}>
          💰 ${formData.budget || '0'} • ⏰ {formData.deadline || 'No deadline'}
        </Text>
        <Text style={styles.debugText}>
          📄 {formData.description.length || 0} chars • 🤖 {formData.aiLevel}
          {formData.aiLevel === 'partial' ? ` (${formData.aiPercentage}%)` : ''}
        </Text>
      </View>
      
      {/* Main Content - Each step handles its own navigation */}
      <View style={styles.content}>
        {renderCurrentStep()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f5f9',
  },
  progressContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2e7d32',
    borderRadius: 2,
    minWidth: 8,
  },
  debugInfo: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#c8e6c9',
  },
  debugText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
    marginBottom: 2,
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorDetails: {
    fontSize: 12,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorButton: {
    backgroundColor: '#d32f2f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default PostScreen;