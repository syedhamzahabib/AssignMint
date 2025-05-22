import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
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
        // AI level is always valid (has default)
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
        // Validate budget is a valid number
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

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
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
    // Log the complete form data for debugging
    console.log('Final form submission:', formData);
    
    try {
      // Here you would typically send the data to your backend
      Alert.alert(
        'Task Posted Successfully! 🎉',
        'Your task has been posted and will be visible to tutors shortly.',
        [
          {
            text: 'OK',
            onPress: resetForm
          }
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

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      currentStep,
    };

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
  };

  return (
    <SafeAreaView style={styles.container}>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
});

export default PostScreen;
