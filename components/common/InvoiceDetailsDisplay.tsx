// components/common/InvoiceDetailsDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { InvoiceDetails } from '../../services/paymentService';

interface InvoiceDetailsDisplayProps {
  invoiceDetails: InvoiceDetails | null;
  onEdit: () => void;
}

const InvoiceDetailsDisplay: React.FC<InvoiceDetailsDisplayProps> = ({
  invoiceDetails,
  onEdit,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!invoiceDetails) {
    return null;
  }

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting - you can enhance this based on your needs
    return phone;
  };

  return (
    <View style={styles.container}>
      <View style={styles.detailsList}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{invoiceDetails.fullName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Address:</Text>
          <Text style={styles.value}>{invoiceDetails.addressLine1}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>City:</Text>
          <Text style={styles.value}>{invoiceDetails.city}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Post Code:</Text>
          <Text style={styles.value}>{invoiceDetails.postCode}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Country:</Text>
          <Text style={styles.value}>{invoiceDetails.country}</Text>
        </View>
        
        {invoiceDetails.taxId && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Tax ID:</Text>
            <Text style={styles.value}>{invoiceDetails.taxId}</Text>
          </View>
        )}
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{invoiceDetails.email}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Phone:</Text>
          <Text style={styles.value}>{formatPhoneNumber(invoiceDetails.phone)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={onEdit}>
        <Ionicons name="pencil" size={16} color={theme.colors.blue500} />
        <Text style={styles.editButtonText}>Edit Invoice Details</Text>
      </TouchableOpacity>
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  detailsList: {
    marginBottom: theme.spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: 14,
    color: theme.colors.gray600,
    fontWeight: '400',
  },
  value: {
    fontSize: 14,
    color: theme.colors.gray800,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  editButtonText: {
    fontSize: 14,
    color: theme.colors.blue500,
    fontWeight: '500',
    marginLeft: theme.spacing.xs,
  },
});

export default InvoiceDetailsDisplay;
