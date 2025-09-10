// components/common/InvoicingDetailsModal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import paymentService, { InvoiceDetails } from '../../services/paymentService';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import PhoneNumberInput from './PhoneNumberInput';
import Button from './Button';

interface InvoicingDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (data: InvoicingData) => void;
  tab?: 'personal' | 'work' | 'other';
  editData?: InvoiceDetails | null;
  isEdit?: boolean;
}

interface InvoicingData {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postCode: string;
  country: string;
  taxId: string;
  email: string;
  confirmEmail: string;
  phone: string;
}

const COUNTRIES = [
  { label: 'United States', value: 'US' },
  { label: 'United Kingdom', value: 'UK' },
  { label: 'Canada', value: 'CA' },
  { label: 'Germany', value: 'DE' },
  { label: 'France', value: 'FR' },
  { label: 'Ukraine', value: 'UA' },
  // Add more countries as needed
];

export default function InvoicingDetailsModal({ visible, onClose, onApply, tab = 'personal', editData = null, isEdit = false }: InvoicingDetailsModalProps) {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<InvoicingData>({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postCode: '',
    country: '',
    taxId: '',
    email: '',
    confirmEmail: '',
    phone: '',
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        fullName: editData.fullName || '',
        addressLine1: editData.addressLine1 || '',
        addressLine2: editData.addressLine2 || '',
        city: editData.city || '',
        postCode: editData.postCode || '',
        country: editData.country || '',
        taxId: editData.taxId || '',
        email: editData.email || '',
        confirmEmail: editData.confirmEmail || '',
        phone: editData.phone || '',
      });
    } else {
      // Reset form for new entry
      setFormData({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        postCode: '',
        country: '',
        taxId: '',
        email: '',
        confirmEmail: '',
        phone: '',
      });
    }
  }, [isEdit, editData, visible]);

  const [errors, setErrors] = useState<Partial<InvoicingData>>({});

  const handleInputChange = (field: keyof InvoicingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<InvoicingData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.postCode.trim()) {
      newErrors.postCode = 'Post code is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Please confirm your email';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApply = async () => {
    if (!validateForm()) return;
    
    if (!user?._id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save to Firebase with tab information
      await paymentService.saveInvoiceDetails(user._id, {
        ...formData,
        tab,
      });
      
      // Call the onApply callback
      onApply(formData);
      
      // Close the modal
      onClose();
      
      Alert.alert('Success', 'Invoice details saved successfully!');
    } catch (error) {
      console.error('Error saving invoice details:', error);
      Alert.alert('Error', 'Failed to save invoice details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isApplyDisabled = !formData.fullName || !formData.addressLine1 || !formData.city || 
                         !formData.postCode || !formData.country || !formData.email || 
                         !formData.confirmEmail || !formData.phone;

  return (
    <Modal visible={visible} onClose={onClose} maxHeight={"99%"}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEdit ? 'Edit Invoice Details' : 'Add Invoicing Details'}
          </Text>
        </View>
        
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={formData.fullName}
            onChangeText={(value) => handleInputChange('fullName', value)}
            error={errors.fullName}
            style={styles.compactInput}
          />

          <Input
            label="Address Line 1"
            placeholder="Enter your address"
            value={formData.addressLine1}
            onChangeText={(value) => handleInputChange('addressLine1', value)}
            error={errors.addressLine1}
            style={styles.compactInput}
          />

          <Input
            label="Address Line 2"
            placeholder="Enter your address"
            value={formData.addressLine2}
            onChangeText={(value) => handleInputChange('addressLine2', value)}
            error={errors.addressLine2}
            style={styles.compactInput}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Input
                label="City"
                placeholder="Enter your city"
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                error={errors.city}
                style={styles.compactInput}
              />
            </View>
            <View style={styles.halfWidth}>
              <Input
                label="Post Code"
                placeholder="Enter post code"
                value={formData.postCode}
                onChangeText={(value) => handleInputChange('postCode', value)}
                error={errors.postCode}
                style={styles.compactInput}
              />
            </View>
          </View>

          <Select
            label="Country"
            placeholder="Select your country"
            value={formData.country}
            onSelectionChange={(value) => handleInputChange('country', value as string)}
            options={COUNTRIES}
            error={errors.country}
            style={styles.countrycompactInput}
          />

          <Input
            label="Tax ID"
            placeholder="Enter your tax ID"
            value={formData.taxId}
            onChangeText={(value) => handleInputChange('taxId', value)}
            error={errors.taxId}
            style={styles.compactInput}
          />

          <Input
            label="Email to Receive Invoices"
            placeholder="Enter your email"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            style={styles.compactInput}
          />

          <Input
            label="Confirm Email"
            placeholder="Confirm your email"
            value={formData.confirmEmail}
            onChangeText={(value) => handleInputChange('confirmEmail', value)}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.confirmEmail}
            style={styles.compactInput}
          />

          <PhoneNumberInput
            label="Phone"
            value={formData.phone}
            onChangeText={(value) => handleInputChange('phone', value)}
            error={errors.phone}
            style={styles.compactInput}
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <Button
            variant="outline"
            title="Cancel"
            onPress={onClose}
            style={styles.cancelButton}
          />
          <Button
            variant="primary"
            title={isLoading ? (isEdit ? "Updating..." : "Saving...") : (isEdit ? "Update" : "Apply")}
            onPress={handleApply}
            disabled={isApplyDisabled || isLoading}
            style={styles.applyButton}
          />
        </View>
      </View>
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
    paddingBottom: theme.spacing.lg,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.gray800,
  },
  form: {
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.white,
  },
  compactInput: {
    height: 50, // Reduced height for compact inputs
  },
  countrycompactInput: {
    height: 50, // Reduced height for compact inputs
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md, 
    paddingVertical: theme.spacing.lg
  },
  cancelButton: {
  },
  applyButton: {
    flex: 1,
  },
});
