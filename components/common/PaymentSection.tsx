// components/common/PaymentSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import paymentService, { InvoiceDetails, PaymentMethod } from '../../services/paymentService';
import InvoicingDetailsModal from './InvoicingDetailsModal';
import InvoiceDetailsDisplay from './InvoiceDetailsDisplay';
import PaymentMethodModal from './PaymentMethodModal';

interface PaymentSectionProps {
  title: string;
  onAddPress: () => void;
  addButtonText: string;
  showInvoicingModal?: boolean;
  tab?: 'personal' | 'work' | 'other';
  isSelectionMode?: boolean;
  selectedPaymentMethod?: any;
  onPaymentMethodSelect?: (paymentMethod: any) => void;
}

interface PaymentMethodItemProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

const PaymentMethodItem: React.FC<PaymentMethodItemProps> = ({
  method,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

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

  return (
    <View style={styles.paymentMethodItem}>
      <TouchableOpacity style={styles.radioButton} onPress={onSelect}>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
      
      <View style={styles.cardIconContainer}>
        <Image source={getCardIcon(method.cardBrand)} style={styles.cardIcon} resizeMode="contain" />
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.cardType}>Credit Card</Text>
        <Text style={styles.cardNumber}>* {method.last4}</Text>
      </View>
      
      <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.blue500} />
      </TouchableOpacity>
    </View>
  );
};

const PaymentSection: React.FC<PaymentSectionProps> = ({
  title,
  onAddPress,
  addButtonText,
  showInvoicingModal = false,
  tab = 'personal',
  isSelectionMode = false,
  selectedPaymentMethod,
  onPaymentMethodSelect,
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const styles = createStyles(theme);

  // Fetch data when component mounts or tab changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      
      setIsLoading(true);
      try {
        if (showInvoicingModal) {
          // Fetch invoice details for invoicing section
          const details = await paymentService.getInvoiceDetails(user._id, tab);
          setInvoiceDetails(details.length > 0 ? details[0] : null);
        } else {
          // Fetch payment methods for payment method section
          const methods = await paymentService.getPaymentMethods(user._id, tab);
          setPaymentMethods(methods);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (showInvoicingModal) {
          setInvoiceDetails(null);
        } else {
          setPaymentMethods([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?._id, tab, showInvoicingModal]);

  const handleAddPress = () => {
    if (showInvoicingModal) {
      setIsEditMode(false);
      setShowModal(true);
    } else {
      setIsEditMode(false);
      setShowModal(true);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setIsEditMode(false);
  };

  const handleEditPress = () => {
    if (showInvoicingModal) {
      console.log('Opening edit modal...');
      setIsEditMode(true);
      setShowModal(true);
    }
  };

  const handleApply = async (data: any) => {
    console.log('Invoice details applied:', data);
    setShowModal(false);

    // Refresh the invoice details after saving
    if (user?._id) {
      try {
        const details = await paymentService.getInvoiceDetails(user._id, tab);
        setInvoiceDetails(details.length > 0 ? details[0] : null);
      } catch (error) {
        console.error('Error refreshing invoice details:', error);
      }
    }
  };

  const handlePaymentMethodSuccess = async (paymentMethod: any) => {
    console.log('Payment method added:', paymentMethod);
    setShowModal(false);

    // Refresh the payment methods after saving
    if (user?._id) {
      try {
        const methods = await paymentService.getPaymentMethods(user._id, tab);
        setPaymentMethods(methods);
      } catch (error) {
        console.error('Error refreshing payment methods:', error);
      }
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (!user?._id) {
                Alert.alert('Error', 'User not found. Please try logging in again.');
                return;
              }
              
              await paymentService.deletePaymentMethod(paymentMethodId, user._id);
              
              // Refresh the payment methods after deletion
              const methods = await paymentService.getPaymentMethods(user._id, tab);
              setPaymentMethods(methods);
              
              // Also update the user store to clear stripeCustomerId if needed
              const { updateUserData } = useAuthStore.getState();
              if (methods.length === 0) {
                await updateUserData({ stripeCustomerId: undefined });
                console.log('User store updated - stripeCustomerId cleared');
              }
            } catch (error) {
              console.error('Error deleting payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : showInvoicingModal ? (
        // Show invoice details for invoicing section
        invoiceDetails ? (
          <InvoiceDetailsDisplay
            invoiceDetails={invoiceDetails}
            onEdit={handleEditPress}
          />
        ) : (
          <>
            <View style={styles.illustrationContainer}>
              <View style={styles.illustration}>
                <Image source={require('@/assets/images/illustration.png')} style={styles.illustrationImage} />
              </View>
            </View>
            <Text style={styles.emptyStateText}>
              You do not have any invoicing details available yet.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={theme.colors.blue500} />
              <Text style={styles.addButtonText}>{addButtonText}</Text>
            </TouchableOpacity>
          </>
        )
      ) : (
        // Show payment methods for payment method section
        paymentMethods.length > 0 ? (
          <View style={styles.paymentMethodsList}>
            {paymentMethods.map((method, index) => (
              <PaymentMethodItem
                key={method.id || index}
                method={method}
                isSelected={isSelectionMode ? selectedPaymentMethod?.id === method.id : index === 0}
                onSelect={() => {
                  if (isSelectionMode && onPaymentMethodSelect) {
                    onPaymentMethodSelect(method);
                  }
                }}
                onDelete={() => handleDeletePaymentMethod(method.id!)}
              />
            ))}
            <TouchableOpacity
              style={styles.addPaymentMethodButton}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              <View style={styles.addButtonIcon}>
                <Ionicons name="add" size={20} color={theme.colors.blue500} />
              </View>
              <Text style={styles.addButtonText}>{addButtonText}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.illustrationContainer}>
              <View style={styles.illustration}>
                <Image source={require('@/assets/images/illustration.png')} style={styles.illustrationImage} />
              </View>
            </View>
            <Text style={styles.emptyStateText}>
              You do not have any payment methods available yet.
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddPress}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={20} color={theme.colors.blue500} />
              <Text style={styles.addButtonText}>{addButtonText}</Text>
            </TouchableOpacity>
          </>
        )
      )}

      {showInvoicingModal && (
        <InvoicingDetailsModal
          visible={showModal}
          onClose={handleModalClose}
          onApply={handleApply}
          tab={tab}
          editData={invoiceDetails}
          isEdit={isEditMode}
        />
      )}

      {!showInvoicingModal && (
        <PaymentMethodModal
          visible={showModal}
          onClose={handleModalClose}
          onSuccess={handlePaymentMethodSuccess}
          tab={tab}
        />
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.gray800,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  illustration: {
    width: 200,
    height: 150,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationImage: {
    width: 100,
    height: 100,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.gray600,
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  addButtonText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.gray600,
  },
  paymentMethodsList: {
    gap: theme.spacing.sm,
  },
  paymentMethodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  radioButton: {
    marginRight: theme.spacing.md,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: theme.colors.blue500,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.blue500,
  },
  cardIconContainer: {
  },
  cardIcon: {
    width: 40,
    height: 30,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardType: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.gray800,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: theme.colors.gray600,
  },
  deleteButton: {
    padding: theme.spacing.sm,
  },
  addPaymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  addButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
});

export default PaymentSection;
