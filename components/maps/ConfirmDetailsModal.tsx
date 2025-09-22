import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Modal from '@/components/common/Modal';
import WhoWillTakeTripModal from './WhoWillTakeTripModal';
import ProfilePaymentModal from './ProfilePaymentModal';

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
    id?: string;
    stripePaymentMethodId?: string;
    customerId?: string;
    cardholderName?: string;
    cardBrand: string;
    last4: string;
    expMonth?: number;
    expYear?: number;
    tab: 'personal' | 'work' | 'other';
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
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
  onTripTakerSelect?: (tripTaker: 'myself' | 'someone', personDetails?: { name: string; phone?: string }) => void;
  onPaymentMethodSelect?: (paymentMethod: any) => void;
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
  onCouponPress,
  onTripTakerSelect,
  onPaymentMethodSelect
}: ConfirmDetailsModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [coupon, setCoupon] = useState('-20% Discount');
  const [showWhoWillTakeTripModal, setShowWhoWillTakeTripModal] = useState(false);
  const [showProfilePaymentModal, setShowProfilePaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState('');

  // Get display values
  const tripTakerDisplay = tripTaker?.type === 'myself'
    ? 'Myself'
    : tripTaker?.name || 'Select person';

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa':
        return require('@/assets/images/visa.png');
      case 'mastercard':
        return require('@/assets/images/mastercard.png');
      case 'amex':
        return require('@/assets/images/visa.png'); // Fallback to visa for now
      default:
        return require('@/assets/images/visa.png'); // Default to visa
    }
  };

  const getPaymentMethodDisplay = () => {
    if (!selectedPaymentMethod) return 'Select payment method';

    return `**** ${selectedPaymentMethod.last4}`;
  };

  const paymentMethodDisplay = getPaymentMethodDisplay();

  // Update paymentType when selectedPaymentMethod changes
  useEffect(() => {
    if (selectedPaymentMethod?.tab) {
      const tabType = selectedPaymentMethod.tab.charAt(0).toUpperCase() + selectedPaymentMethod.tab.slice(1);
      setPaymentType(tabType);
    } else {
      setPaymentType('');
    }
  }, [selectedPaymentMethod]);

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      maxHeight="70%"
      showTopBar={true}
      backdropOpacity={0}
      containerStyle={{ gap: theme.spacing.sm }}
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
        <View style={styles.selectContainer}>
          <View style={styles.labelContainer}>
            <View style={styles.labelBorderOverlay} />
            <Text style={styles.label}>
              Who Will Take the Trip?
              {/* <Text style={styles.required}>*</Text> */}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowWhoWillTakeTripModal(true)}
          >
            <Text style={styles.selectText}>{tripTakerDisplay}</Text>
            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Section */}
      <View style={styles.section}>
        <View style={styles.selectContainer}>
          <View style={styles.labelContainer}>
            <View style={styles.labelBorderOverlay} />
            <Text style={styles.label}>
              Invoice|Payment
              {/* <Text style={styles.required}>*</Text> */}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowProfilePaymentModal(true)}
          >
            {selectedPaymentMethod ? (
              <View style={styles.paymentMethodContent}>
                <Text style={styles.selectText}>{paymentType} | </Text>
                <Image
                  source={getCardIcon(selectedPaymentMethod.cardBrand)}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.selectText}>{paymentMethodDisplay}</Text>
              </View>
            ) :
              <View>
                <Text style={styles.selectText}>Select payment method</Text>
              </View>
            }
            <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Coupon Section */}
      <View style={styles.section}>
        <Input
          label="Coupon"
          placeholder="Enter coupon code"
          value={coupon}
          onChangeText={setCoupon}
          style={styles.textInput}
        />
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

      {/* Who Will Take Trip Modal */}
      <WhoWillTakeTripModal
        visible={showWhoWillTakeTripModal}
        onClose={() => setShowWhoWillTakeTripModal(false)}
        onSelect={(tripTakerType, personDetails) => {
          if (onTripTakerSelect) {
            onTripTakerSelect(tripTakerType, personDetails);
          }
          setShowWhoWillTakeTripModal(false);
        }}
      />

      {/* Profile Payment Modal */}
      <ProfilePaymentModal
        visible={showProfilePaymentModal}
        onClose={() => setShowProfilePaymentModal(false)}
        isSelectionMode={true}
        onPaymentMethodSelect={(paymentMethod) => {
          if (onPaymentMethodSelect) {
            onPaymentMethodSelect(paymentMethod);
          }
          setShowProfilePaymentModal(false);
        }}
      />
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
    marginBottom: theme.spacing.md,
  },
  selectContainer: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 18,
    top: -8,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: theme.colors.gray500,
    paddingHorizontal: 2,
    fontWeight: '700',
  },
  labelBorderOverlay: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    top: 8,
  },
  required: {
    color: theme.colors.error,
  },
  selectButton: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: 1000,
    minHeight: 48,
  },
  selectText: {
    fontSize: 16,
    color: theme.colors.gray800,
    paddingVertical: theme.spacing.md,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIcon: {
    width: 30,
    height: 20,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.lightGray,
  },
  selectInput: {
    backgroundColor: '#FFFFFF',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backActionButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 45,
    borderRadius: theme.borderRadius.full,
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
    borderRadius: theme.borderRadius.full,
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
