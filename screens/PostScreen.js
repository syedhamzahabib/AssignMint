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
    console.log('Updating form data:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.subject.trim()) {
          Alert.alert('Required Field', 'Please select a subject');
          return false;
        }
        if (!formData.title.trim()) {
          Alert.alert('Required Field', 'Please enter a task title');
          return false;
        }
        return true;
      case 2:
        if (!formData.description.trim()) {
          Alert.alert('Required Field', 'Please enter a task description');
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        if (!formData.deadline) {
          Alert.alert('Required Field', 'Please select a deadline');
          return false;
        }
        if (!formData.budget.trim()) {
          Alert.alert('Required Field', 'Please enter your budget');
          return false;
        }
        const budgetNumber = parseFloat(formData.budget);
        if (isNaN(budgetNumber) || budgetNumber <= 0) {
          Alert.alert('Invalid Budget', 'Please enter a valid budget amount');
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
      Alert.alert(
        'Task Posted Successfully! 🎉',
        'Your task has been posted and will be visible to tutors shortly.',
        [
          {
            text: 'OK',
            onPress: resetForm,
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting task:', error);
      Alert.alert(
        'Error',
        'There was an error posting your task. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleNext = () => {
    console.log('Next button pressed, current step:', currentStep);
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    console.log('Back button pressed, current step:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderCurrentStep = () => {
    console.log('Rendering step:', currentStep);
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
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
          <Text style={styles.errorText}>Error rendering step {currentStep}</Text>
          <Text style={styles.errorDetails}>{error.toString()}</Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.debugInfo}>
          <Text style={styles.debugText}>Debug: Step {currentStep}</Text>
          <Text style={styles.debugText}>Subject: {formData.subject || 'None'}</Text>
          <Text style={styles.debugText}>Budget: ${formData.budget || '0'}</Text>
          <Text style={styles.debugText}>Deadline: {formData.deadline || 'None'}</Text>
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  debugInfo: {
    backgroundColor: '#e8f5e8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '500',
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
  errorText: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
});

export default PostScreen;
