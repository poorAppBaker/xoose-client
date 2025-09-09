// components/common/PaymentSection.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import InvoicingDetailsModal from './InvoicingDetailsModal';

interface PaymentSectionProps {
  title: string;
  onAddPress: () => void;
  addButtonText: string;
  showInvoicingModal?: boolean;
}

const PaymentSection: React.FC<PaymentSectionProps> = ({
  title,
  onAddPress,
  addButtonText,
  showInvoicingModal = false
}) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const styles = createStyles(theme);

  const handleAddPress = () => {
    if (showInvoicingModal) {
      console.log('Opening invoicing modal...');
      setShowModal(true);
    } else {
      onAddPress();
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const handleApply = (data: any) => {
    console.log('Invoicing data:', data);
    // TODO: Handle the invoicing data
    onAddPress();
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
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

      {showInvoicingModal && (
        <InvoicingDetailsModal
          visible={showModal}
          onClose={handleModalClose}
          onApply={handleApply}
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
});

export default PaymentSection;
