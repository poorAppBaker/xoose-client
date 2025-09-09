// app/(tabs)/profilepayment.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
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
  const [selectedProfileType, setSelectedProfileType] = useState('personal');
  const styles = createStyles(theme);

  const handleBack = () => {
    router.back();
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
          />

          {/* Invoicing Section */}
          <PaymentSection
            title="Invoicing"
            onAddPress={handleAddInvoicingDetails}
            addButtonText="Add Invoicing Details"
            showInvoicingModal={true}
          />
        </View>

        {/* Back Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.backButtonBottom} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
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
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
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
    marginBottom: theme.spacing.xl,
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
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
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
});
