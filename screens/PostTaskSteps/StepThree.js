import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Slider,
} from 'react-native';

const StepThree = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const aiOptions = [
    {
      id: 'none',
      title: 'No AI',
      subtitle: 'Human tutor only',
      icon: '👨‍🏫',
    },
    {
      id: 'partial',
      title: 'Partial AI',
      subtitle: 'AI assistance with human oversight',
      icon: '🤖',
    },
    {
      id: 'full',
      title: 'Full AI (100%)',
      subtitle: 'Complete AI solution',
      icon: '🚀',
    },
  ];

  const selectAILevel = (level) => {
    updateFormData('aiLevel', level);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Task (3/4)</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Form Content */}
      <View style={styles.form}>
        <Text style={styles.label}>🤖 Choose AI Level</Text>

        {/* AI Options */}
        {aiOptions.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.optionCard,
              formData.aiLevel === option.id && styles.selectedOption,
            ]}
            onPress={() => selectAILevel(option.id)}
          >
            <View style={styles.optionContent}>
              <View style={styles.radioContainer}>
                <View style={[
                  styles.radioOuter,
                  formData.aiLevel === option.id && styles.radioSelected,
                ]}>
                  {formData.aiLevel === option.id && (
                    <View style={styles.radioInner} />
                  )}
                </View>
              </View>

              <Text style={styles.optionIcon}>{option.icon}</Text>

              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

        {/* AI Percentage Slider */}
        {formData.aiLevel === 'partial' && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>AI Assistance Level</Text>
            <View style={styles.sliderWrapper}>
              <Text style={styles.sliderValue}>{formData.aiPercentage}%</Text>
              <Slider
                style={styles.slider}
                minimumValue={10}
                maximumValue={70}
                step={5}
                value={formData.aiPercentage}
                onValueChange={(value) => updateFormData('aiPercentage', value)}
                minimumTrackTintColor="#2e7d32"
                maximumTrackTintColor="#e5e5e5"
                thumbStyle={styles.sliderThumb}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderMin}>10%</Text>
                <Text style={styles.sliderMax}>70%</Text>
              </View>
            </View>
            <Text style={styles.sliderDescription}>
              Higher percentage means more AI involvement in solving your task
            </Text>
          </View>
        )}
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next →</Text>
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
    marginBottom: 20,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  selectedOption: {
    borderColor: '#2e7d32',
    backgroundColor: '#f8fff8',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: '#2e7d32',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2e7d32',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  sliderContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  sliderLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  sliderWrapper: {
    marginBottom: 12,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#2e7d32',
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderMin: {
    fontSize: 12,
    color: '#666',
  },
  sliderMax: {
    fontSize: 12,
    color: '#666',
  },
  sliderDescription: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'flex-end',
  },
  nextButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StepThree;
