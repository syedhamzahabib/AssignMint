import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

const StepFive = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const [selectedPayment, setSelectedPayment] = useState(null);

  const paymentMethods = [
    { id: '1', name: 'Visa •••• 4242', icon: '💳' },
    { id: '2', name: 'Mastercard •••• 8888', icon: '💳' },
    { id: '3', name: 'PayPal', icon: '🅿️' },
  ];

  const formatAILevel = () => {
    switch (formData.aiLevel) {
      case 'none':
        return 'No AI (Human only)';
      case 'partial':
        return `Partial AI (${formData.aiPercentage}%)`;
      case 'full':
        return 'Full AI (100%)';
      default:
        return 'No AI';
    }
  };

  const calculateTotal = () => {
    const budget = parseFloat(formData.budget) || 0;
    const serviceFee = budget * 0.05; // 5% service fee
    return {
      budget,
      serviceFee,
      total: budget + serviceFee,
    };
  };

  const { budget, serviceFee, total } = calculateTotal();

  const selectPaymentMethod = (method) => {
    // If clicking the same method, deselect it
    if (selectedPayment?.id === method.id) {
      setSelectedPayment(null);
      updateFormData('paymentMethod', null);
    } else {
      // Select the new method
      setSelectedPayment(method);
      updateFormData('paymentMethod', method);
    }
  };

  const handleConfirm = () => {
    if (!selectedPayment) {
      Alert.alert('Payment Required', 'Please select a payment method');
      return;
    }
    onNext(); // This will call handleSubmit in PostScreen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Task</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Task Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📋 Task Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subject:</Text>
            <Text style={styles.summaryValue}>{formData.subject}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Title:</Text>
            <Text style={styles.summaryValue}>{formData.title}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Due:</Text>
            <Text style={styles.summaryValue}>{formData.deadline}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>AI Level:</Text>
            <Text style={styles.summaryValue}>{formatAILevel()}</Text>
          </View>
<<<<<<< HEAD
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>🖊️ Description</Text>
          <Text style={styles.descriptionText}>{formData.description}</Text>
          
          {formData.specialInstructions && (
            <>
              <Text style={styles.instructionsLabel}>Special Instructions:</Text>
              <Text style={styles.instructionsText}>{formData.specialInstructions}</Text>
            </>
          )}
        </View>

        {/* Additional Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>📄 Additional Details</Text>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>📎 Files:</Text>
            <Text style={styles.detailValue}>None</Text>
          </View>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>🎯 Matching:</Text>
            <Text style={styles.detailValue}>
              {formData.matchingType === 'auto' ? 'Auto-match ⚡' : 'Manual Review 👀'}
            </Text>
          </View>
        </View>

=======
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>🖊️ Description</Text>
          <Text style={styles.descriptionText}>{formData.description}</Text>
          
          {formData.specialInstructions && (
            <>
              <Text style={styles.instructionsLabel}>Special Instructions:</Text>
              <Text style={styles.instructionsText}>{formData.specialInstructions}</Text>
            </>
          )}
        </View>

>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>💳 Payment Method</Text>
          <Text style={styles.paymentSubtitle}>Select one (tap to change)</Text>
          
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment?.id === method.id && styles.selectedPayment
              ]}
              onPress={() => selectPaymentMethod(method)}
            >
              <Text style={styles.paymentIcon}>{method.icon}</Text>
              <Text style={styles.paymentName}>{method.name}</Text>
              {selectedPayment?.id === method.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Cost Breakdown */}
        <View style={styles.costCard}>
          <Text style={styles.cardTitle}>💰 Cost Breakdown</Text>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Task Budget</Text>
            <Text style={styles.costValue}>${budget.toFixed(2)}</Text>
          </View>
          
          <View style={styles.costRow}>
            <Text style={styles.costLabel}>Service Fee (5%)</Text>
            <Text style={styles.costValue}>${serviceFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Escrow Notice */}
        <View style={styles.escrowNotice}>
          <Text style={styles.escrowIcon}>🔒</Text>
          <Text style={styles.escrowText}>
            Your funds are held securely and only released when the task is completed
          </Text>
        </View>

        {/* Add some bottom padding for the fixed button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed Confirm Button */}
      <View style={styles.fixedButtonContainer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            !selectedPayment && styles.disabledButton
          ]} 
          onPress={handleConfirm}
          disabled={!selectedPayment}
        >
          <Text style={styles.confirmButtonText}>
            Confirm & Post Task (${total.toFixed(2)})
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 100, // Extra space for the fixed button
  },
  bottomSpacer: {
    height: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
<<<<<<< HEAD
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
=======
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
<<<<<<< HEAD
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
=======
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 8,
  },
  instructionsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
<<<<<<< HEAD
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  detailSection: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
=======
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
<<<<<<< HEAD
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
=======
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginBottom: 8,
  },
  selectedPayment: {
    borderColor: '#2e7d32',
    backgroundColor: '#f8fff8',
  },
  paymentIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  paymentName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
<<<<<<< HEAD
=======
  selectedPaymentDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2e7d32',
    backgroundColor: '#f8fff8',
  },
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  checkmark: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: 'bold',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
<<<<<<< HEAD
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
=======
>>>>>>> 75c1fa6 (🔁 Updated all PostTaskSteps and PostScreen.js to final 5-step flow)
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: '#666',
  },
  costValue: {
    fontSize: 14,
    color: '#111',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  totalLabel: {
    fontSize: 16,
    color: '#111',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 16,
    color: '#2e7d32',
    fontWeight: '700',
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  escrowIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  escrowText: {
    fontSize: 12,
    color: '#2e7d32',
    flex: 1,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f4f5f9',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default StepFive;
