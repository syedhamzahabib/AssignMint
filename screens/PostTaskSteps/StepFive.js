import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';

const paymentMethods = [
  {
    id: '1',
    type: 'credit',
    brand: 'Visa',
    last4: '4242',
    icon: '💳',
  },
  {
    id: '2',
    type: 'credit',
    brand: 'Mastercard',
    last4: '8888',
    icon: '💳',
  },
  {
    id: 'new',
    type: 'new',
    brand: 'Add New Card',
    icon: '➕',
  },
];

const StepFive = ({ formData, updateFormData, onNext, onBack, currentStep }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const formatFiles = () => {
    const allFiles = [...formData.images, ...formData.files];
    if (allFiles.length === 0) return 'None';
    return allFiles.map(file => file.name || 'Uploaded file').join(', ');
  };

  const selectPaymentMethod = (method) => {
    updateFormData('paymentMethod', method);
    setShowPaymentModal(false);
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Task Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>📋 Task Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📚 Subject:</Text>
            <Text style={styles.summaryValue}>{formData.subject}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📌 Title:</Text>
            <Text style={styles.summaryValue}>{formData.title}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>⏰ Due:</Text>
            <Text style={styles.summaryValue}>{formData.deadline}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>🤖 AI Level:</Text>
            <Text style={styles.summaryValue}>{formatAILevel()}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>💰 Budget:</Text>
            <Text style={[styles.summaryValue, styles.budgetText]}>${formData.budget}</Text>
          </View>
        </View>

        {/* Additional Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>📄 Additional Details</Text>
          
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>📎 Files:</Text>
            <Text style={styles.detailValue}>{formatFiles()}</Text>
          </View>
          
          {formData.specialInstructions && (
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>📑 Special Instructions:</Text>
              <Text style={styles.detailValue}>{formData.specialInstructions}</Text>
            </View>
          )}
          
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>🎯 Matching:</Text>
            <Text style={styles.detailValue}>
              {formData.matchingType === 'auto' ? 'Auto-match ⚡' : 'Manual Review 👀'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.cardTitle}>🖊️ Task Description</Text>
          <Text style={styles.descriptionText}>{formData.description}</Text>
        </View>

        {/* Payment Method */}
        <View style={styles.paymentCard}>
          <Text style={styles.cardTitle}>💳 Payment Method</Text>
          
          {formData.paymentMethod ? (
            <View style={styles.selectedPayment}>
              <Text style={styles.paymentIcon}>{formData.paymentMethod.icon}</Text>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentBrand}>{formData.paymentMethod.brand}</Text>
                {formData.paymentMethod.last4 && (
                  <Text style={styles.paymentLast4}>•••• {formData.paymentMethod.last4}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setShowPaymentModal(true)}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addPaymentButton}
              onPress={() => setShowPaymentModal(true)}
            >
              <Text style={styles.addPaymentIcon}>➕</Text>
              <Text style={styles.addPaymentText}>Add or select payment method</Text>
            </TouchableOpacity>
          )}
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
        <View style={styles.escrowCard}>
          <Text style={styles.escrowIcon}>🔒</Text>
          <Text style={styles.escrowTitle}>Secure Escrow Protection</Text>
          <Text style={styles.escrowText}>
            Your funds are held securely and only released when the assignment is completed to your satisfaction.
          </Text>
        </View>

        <View style={styles.spacer} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.confirmButton} onPress={onNext}>
          <Text style={styles.confirmButtonText}>
            Confirm & Post (${total.toFixed(2)})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPaymentModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            
            <FlatList
              data={paymentMethods}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.paymentOption}
                  onPress={() => selectPaymentMethod(item)}
                >
                  <Text style={styles.paymentOptionIcon}>{item.icon}</Text>
                  <View style={styles.paymentOptionInfo}>
                    <Text style={styles.paymentOptionBrand}>{item.brand}</Text>
                    {item.last4 && (
                      <Text style={styles.paymentOptionLast4}>•••• {item.last4}</Text>
                    )}
                  </View>
                  {item.type === 'new' && (
                    <Text style={styles.newBadge}>NEW</Text>
                  )}
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
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#f8f9fa',
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
    paddingTop: 20,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  budgetText: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: '700',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
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
  descriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  descriptionText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  paymentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  selectedPayment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fff8',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2e7d32',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  paymentLast4: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  changeButton: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  changeButtonText: {
    color: '#2e7d32',
    fontSize: 14,
    fontWeight: '600',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    borderStyle: 'dashed',
  },
  addPaymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addPaymentText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  costCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 15,
    color: '#666',
  },
  costValue: {
    fontSize: 15,
    color: '#111',
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  totalLabel: {
    fontSize: 18,
    color: '#111',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: '#2e7d32',
    fontWeight: '700',
  },
  escrowCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  escrowIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  escrowText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  spacer: {
    height: 20,
  },
  buttonContainer: {
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: '#f8f9fa',
  },
  confirmButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#2e7d32',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
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
    padding: 20,
    paddingBottom: 34,
    maxHeight: '50%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#111',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  paymentOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentOptionInfo: {
    flex: 1,
  },
  paymentOptionBrand: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  paymentOptionLast4: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  newBadge: {
    backgroundColor: '#2e7d32',
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
});

export default StepFive;