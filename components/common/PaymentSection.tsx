// components/common/PaymentSection.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import paymentService, { InvoiceDetails } from '../../services/paymentService';
import InvoicingDetailsModal from './InvoicingDetailsModal';
import InvoiceDetailsDisplay from './InvoiceDetailsDisplay';

interface PaymentSectionProps {
  title: string;
  onAddPress: () => void;
  addButtonText: string;
  showInvoicingModal?: boolean;
  tab?: 'personal' | 'work' | 'other';
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  title,
  onAddPress,
  addButtonText,
  showInvoicingModal = false,
  tab = 'personal',
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const styles = createStyles(theme);

  // Fetch invoice details when component mounts or tab changes
  // Only fetch for invoicing section (when showInvoicingModal is true)
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      if (!user?._id || !showInvoicingModal) return;
      
      setIsLoading(true);
      try {
        const details = await paymentService.getInvoiceDetails(user._id, tab);
        // Get the most recent invoice detail for this tab
        setInvoiceDetails(details.length > 0 ? details[0] : null);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
        setInvoiceDetails(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [user?._id, tab, showInvoicingModal]);

  const handleAddPress = () => {
    if (showInvoicingModal) {
      console.log('Opening invoicing modal...');
      setIsEditMode(false);
      setShowModal(true);
    } else {
      onAddPress();
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      
      {showInvoicingModal ? (
        // Only show invoice details for invoicing section
        isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : invoiceDetails ? (
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
        // For payment method section, always show empty state
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
});

export default PaymentSection;
