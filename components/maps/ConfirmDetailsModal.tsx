import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';

interface LocationItem {
  coordinate: [number, number];
  title: string;
  subtitle: string;
}

interface TripTaker {
  type: 'myself' | 'someone';
  name?: string;
  phone?: string;
}

interface PaymentMethod {
  type: string;
  last4: string;
  brand: string;
}

interface ConfirmDetailsModalProps {
  visible: boolean;
  pickup?: LocationItem | null;
  destination?: LocationItem | null;
  selectedPaymentMethod?: {
    type: string;
    last4: string;
    brand: string;
  } | null;
  tripTaker?: {
    type: 'myself' | 'someone';
    name?: string;
    phone?: string;
  };
  isCreatingBooking?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onClose: () => void;
  onTripTakerPress: () => void;
  onPaymentPress: () => void;
  onCouponPress: () => void;
}

export default function ConfirmDetailsModal({
  visible,
  pickup,
  destination,
  selectedPaymentMethod,
  tripTaker,
  isCreatingBooking = false,
  onBack,
  onContinue,
  onClose,
  onTripTakerPress,
  onPaymentPress,
  onCouponPress
}: ConfirmDetailsModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [coupon, setCoupon] = useState('-20% Discount');

  // Get display values
  const tripTakerDisplay = tripTaker?.type === 'myself' 
    ? 'Myself' 
    : tripTaker?.name || 'Select person';
  
  const paymentMethodDisplay = selectedPaymentMethod 
    ? `${selectedPaymentMethod.type} | **** ${selectedPaymentMethod.last4}`
    : 'Select payment method';

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      maxHeight="70%"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Details</Text>
        <View style={styles.placeholder} />
      </View>

        {/* Trip Taker Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Who Will Take the Trip?</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={onTripTakerPress}>
            <Text style={styles.sectionText}>{tripTakerDisplay}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Invoice|Payment</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={onPaymentPress}>
            <Text style={styles.sectionText}>{paymentMethodDisplay}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Coupon Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Coupon</Text>
          <TouchableOpacity style={styles.sectionButton} onPress={onCouponPress}>
            <Text style={styles.sectionText}>{coupon}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.backActionButton} onPress={onBack} disabled={isCreatingBooking}>
            <Text style={styles.backActionButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.continueButton, isCreatingBooking && styles.continueButtonDisabled]} 
            onPress={onContinue}
            disabled={isCreatingBooking}
          >
            <Text style={styles.continueButtonText}>
              {isCreatingBooking ? 'Creating Booking...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    color: theme.colors.gray600,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  sectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionText: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  cardIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.blue100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.xs,
  },
  cardText: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  backActionButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  backActionButtonText: {
    ...theme.typography.button,
    color: theme.colors.blue500,
  },
  continueButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.blue500,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  continueButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  continueButtonDisabled: {
    backgroundColor: theme.colors.gray300,
  },
});
