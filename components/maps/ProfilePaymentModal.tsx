import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import PaymentSection from '../common/PaymentSection';

const PROFILE_TYPES = [
  { id: 'personal', label: 'Personal' },
  { id: 'work', label: 'Work' },
  { id: 'other', label: 'Other' }
];

interface ProfilePaymentModalProps {
  visible: boolean;
  onClose: () => void;
  isSelectionMode?: boolean;
  onPaymentMethodSelect?: (paymentMethod: any) => void;
}

export default function ProfilePaymentModal({
  visible,
  onClose,
  isSelectionMode = false,
  onPaymentMethodSelect
}: ProfilePaymentModalProps) {
  const { theme } = useTheme();
  const [selectedProfileType, setSelectedProfileType] = useState('personal');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const styles = createStyles(theme);

  const handlePaymentMethodSelect = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handleSelect = () => {
    if (selectedPaymentMethod && isSelectionMode && onPaymentMethodSelect) {
      onPaymentMethodSelect(selectedPaymentMethod);
      onClose();
    }
  };

  const handleAddPaymentMethod = () => {
    // TODO: Navigate to add payment method screen
    console.log('Add Payment Method');
  };

  const handleAddInvoicingDetails = () => {
    // TODO: Navigate to add invoicing details screen
    console.log('Add Invoicing Details');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      maxHeight="100%"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Payment</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Type Selector */}
        <View style={styles.profileTypeContainer}>
          <View style={styles.segmentedControl}>
            {PROFILE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.segmentButton,
                  selectedProfileType === type.id && styles.segmentButtonActive
                ]}
                onPress={() => setSelectedProfileType(type.id)}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    selectedProfileType === type.id && styles.segmentButtonTextActive
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Payment Method Section */}
          <PaymentSection
            title="Payment Method"
            onAddPress={handleAddPaymentMethod}
            addButtonText="Add Payment Method"
            showInvoicingModal={false}
            tab={selectedProfileType as 'personal' | 'work' | 'other'}
            isSelectionMode={isSelectionMode}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
          />

          {/* Invoicing Section */}
          <PaymentSection
            title="Invoicing"
            onAddPress={handleAddInvoicingDetails}
            addButtonText="Add Invoicing Details"
            showInvoicingModal={true}
            tab={selectedProfileType as 'personal' | 'work' | 'other'}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.bottomContainer}>
          {isSelectionMode ? (
            <View style={styles.selectionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.selectButton, !selectedPaymentMethod && styles.selectButtonDisabled]} 
                onPress={handleSelect}
                disabled={!selectedPaymentMethod}
              >
                <Text style={styles.selectButtonText}>Select</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.backButtonBottom} onPress={onClose}>
              <Text style={styles.backButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray800,
  },
  placeholder: {
    width: 40,
  },
  profileTypeContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.blue500,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.gray600,
  },
  segmentButtonTextActive: {
    color: theme.colors.white,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  backButtonBottom: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.blue500,
    borderRadius: 25,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.blue500,
    borderRadius: 25,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.blue500,
  },
  selectButton: {
    flex: 1,
    backgroundColor: theme.colors.blue500,
    borderRadius: 25,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: theme.colors.gray300,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.white,
  },
});
