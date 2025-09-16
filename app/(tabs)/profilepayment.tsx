// app/(tabs)/profilepayment.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import PaymentSection from '@/components/common/PaymentSection';

const PROFILE_TYPES = [
  { id: 'personal', label: 'Personal' },
  { id: 'work', label: 'Work' },
  { id: 'other', label: 'Other' }
];

export default function ProfilePaymentScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [selectedProfileType, setSelectedProfileType] = useState('personal');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<any>(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const styles = createStyles(theme);

  useEffect(() => {
    if (params.selectionMode === 'true') {
      setIsSelectionMode(true);
    }
  }, [params.selectionMode]);

  const handleBack = () => {
    router.back();
  };

  const handlePaymentMethodSelect = (paymentMethod: any) => {
    setSelectedPaymentMethod(paymentMethod);
  };

  const handleSelect = () => {
    if (selectedPaymentMethod && isSelectionMode) {
      // Return to dashboard with selected payment method
      router.push({
        pathname: '/(tabs)/dashboard',
        params: {
          selectedPaymentMethod: JSON.stringify(selectedPaymentMethod)
        }
      });
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
    <DefaultLayout>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile & Payment</Text>
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

          <View style={styles.separator} />
          
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
              <TouchableOpacity style={styles.backButtonBottom} onPress={handleBack}>
                <Text style={styles.backButtonText}>Cancel</Text>
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
            <TouchableOpacity style={styles.backButtonBottom} onPress={handleBack}>
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.sm,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray800,
  },
  profileTypeContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  segmentedControl: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.blue300,
  },
  segmentButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: theme.colors.gray400,
  },
  segmentButtonTextActive: {
    color: theme.colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: 40,
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
    marginBottom: 40,
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
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: theme.spacing.md,
  },
});
