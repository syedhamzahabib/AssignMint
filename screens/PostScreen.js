import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  BackHandler,
} from 'react-native';
import StepOne from './PostTaskSteps/StepOne';
import StepTwo from './PostTaskSteps/StepTwo';
import StepThree from './PostTaskSteps/StepThree';
import StepFour from './PostTaskSteps/StepFour';
import StepFive from './PostTaskSteps/StepFive';

const PostScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: '',
    images: [],
    files: [],
    aiLevel: 'none', // 'none', 'partial', 'full'
    aiPercentage: 40,
    deadline: '',
    specialInstructions: '',
    matchingType: 'auto', // 'auto' or 'manual'
    budget: '',
    paymentMethod: null,
  });

  // Handle Android back button
  useEffect(() => {
    const backAction = () => {
      if (currentStep > 1) {
        handleBack();
        return true; // Prevent default back action
      }
      return false; // Allow default back action (exit screen)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [currentStep]);

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
        if (formData.title.trim().length < 10) {
          Alert.alert('Invalid Title', 'Task title must be at least 10 characters long');
          return false;
        }
        return true;
      
      case 2:
        if (!formData.description.trim()) {
          Alert.alert('Required Field', 'Please enter a task description');
          return false;
        }
        if (formData.description.trim().length < 50) {
          Alert.alert('Invalid Description', 'Task description must be at least 50 characters long');
          return false;
        }
        return true;
      
      case 3:
        // AI level is always valid (has default)
        if (formData.aiLevel === 'partial' && (formData.aiPercentage < 10 || formData.aiPercentage > 70)) {
          Alert.alert('Invalid AI Level', 'AI percentage must be between 10% and 70%');
          return false;
        }
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
        const budget = parseFloat(formData.budget);
        if (isNaN(budget) || budget < 5) {
          Alert.alert('Invalid Budget', 'Budget must be at least $5');
          return false;
        }
        if (budget > 1000) {
          Alert.alert('Invalid Budget', 'Budget cannot exceed $1000');
          return false;
        }
        return true;
      
      case 5:
        if (!formData.paymentMethod) {
          Alert.alert('Required Field', 'Please add a payment method');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (validateStep(currentStep)) {
      if (currentStep < 5) {
        setCurrentStep(prev => prev + 1);
      } else {
        await handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else {
      // Show confirmation dialog when trying to exit from first step
      Alert.alert(
        'Exit Task Creation',
        'Are you sure you want to exit? Your progress will be lost.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            style: 'destructive',
            onPress: () => navigation?.goBack(),
          },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real app, you would make an API call here
      // const response = await api.createTask(formData);
      
      Alert.alert(
        'Task Posted Successfully! 🎉',
        'Your task has been posted and will be visible to tutors shortly. You will receive notifications when tutors show interest.',
        [
          {
            text: 'View My Tasks',
            onPress: () => {
              resetForm();
              // Navigate to tasks screen
              navigation?.navigate('MyTasks');
            }
          },
          {
            text: 'Post Another Task',
            onPress: () => {
              resetForm();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to post your task. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => setIsSubmitting(false),
          }
        ]
      );
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
      deadline: '',
      specialInstructions: '',
      matchingType: 'auto',
      budget: '',
      paymentMethod: null,
    });
    setCurrentStep(1);
    setIsSubmitting(false);
  };

  const getStepProgress = () => {
    return (currentStep / 5) * 100;
  };

  const renderCurrentStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      onNext: handleNext,
      onBack: handleBack,
      currentStep,
      isSubmitting,
      totalSteps: 5,
      progress: getStepProgress(),
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