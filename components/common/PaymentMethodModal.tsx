// components/common/PaymentMethodModal.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthStore from '../../store/authStore';
import paymentService from '../../services/paymentService';
import stripeService from '../../services/stripeService';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface PaymentMethodModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (paymentMethod: any) => void;
  tab?: 'personal' | 'work' | 'other';
}

interface PaymentMethodData {
  cardholderName: string;
}

export default function PaymentMethodModal({ visible, onClose, onSuccess, tab = 'personal' }: PaymentMethodModalProps) {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const stripe = useStripe();
  const styles = createStyles(theme);
  const [isLoading, setIsLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);

  const [formData, setFormData] = useState<PaymentMethodData>({
    cardholderName: '',
  });

  const [errors, setErrors] = useState<Partial<PaymentMethodData>>({});

  const handleInputChange = (field: keyof PaymentMethodData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    let newErrors: Partial<PaymentMethodData> = {};
    if (!formData.cardholderName) newErrors.cardholderName = 'Cardholder Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = async () => {
    if (!validateForm() || !cardDetails?.complete) {
      Alert.alert('Error', 'Please fill in all card details correctly');
      return;
    }

    if (!user?._id) {
      Alert.alert('Error', 'User not found. Please try logging in again.');
      return;
    }

    if (!stripe) {
      Alert.alert('Error', 'Stripe is not initialized. Please try again.');
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Create payment method using Stripe SDK
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        paymentMethodType: 'Card',
        paymentMethodData: {
          billingDetails: {
            name: formData.cardholderName,
          },
        },
      });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (!paymentMethod?.id) {
        Alert.alert('Error', 'Failed to create payment method');
        return;
      }

      // Debug: Log the payment method object to see its structure
      console.log('Payment method object:', JSON.stringify(paymentMethod, null, 2));

      // Step 2: Get or create Stripe customer
      let customerId = user.stripeCustomerId;
      console.log('Current user stripeCustomerId:', customerId);
      
      if (!customerId) {
        console.log('Creating new Stripe customer...');
        const customer = await stripeService.createCustomer(
          user.email || '', 
          user.displayName || ''
        ) as { customerId: string };
        customerId = customer.customerId;
        console.log('Created customer with ID:', customerId);
        
        // Update user with Stripe customer ID in Firestore
        console.log('Updating user document with customerId...');
        await paymentService.updateUserStripeCustomerId(user._id, customerId);
        console.log('User document updated successfully');
        
        // Also update the user store
        const { updateUserData } = useAuthStore.getState();
        await updateUserData({ stripeCustomerId: customerId });
        console.log('User store updated with customerId');
      } else {
        console.log('Using existing customer ID:', customerId);
        // Verify the customer exists in Stripe before proceeding
        try {
          await stripeService.verifyCustomerExists(customerId);
          console.log('Customer verified in Stripe');
        } catch (error) {
          console.log('Customer not found in Stripe, creating new one...');
          const customer = await stripeService.createCustomer(
            user.email || '', 
            user.displayName || ''
          ) as { customerId: string };
          customerId = customer.customerId;
          console.log('Created new customer with ID:', customerId);
          
          // Update user with new Stripe customer ID
          await paymentService.updateUserStripeCustomerId(user._id, customerId);
          const { updateUserData } = useAuthStore.getState();
          await updateUserData({ stripeCustomerId: customerId });
          console.log('User updated with new customer ID');
        }
      }

      // Step 3: Attach payment method to customer
      console.log('About to attach payment method:', paymentMethod.id, 'to customer:', customerId);
      if (!customerId) {
        throw new Error('Customer ID is undefined - cannot attach payment method');
      }
      await stripeService.attachPaymentMethod(paymentMethod.id, customerId);

      // Step 4: Save payment method info to Firebase
      // The Stripe React Native SDK uses capital 'Card' instead of lowercase 'card'
      const cardDetails = (paymentMethod as any).Card;
      console.log('Card details from payment method:', cardDetails);
      
      const paymentMethodData = {
        stripePaymentMethodId: paymentMethod.id,
        customerId: customerId, // Add customerId to the payment method data
        cardholderName: formData.cardholderName,
        cardBrand: cardDetails?.brand || 'unknown',
        last4: cardDetails?.last4 || '0000',
        expMonth: cardDetails?.expMonth || 0, // Note: expMonth not exp_month
        expYear: cardDetails?.expYear || 0,   // Note: expYear not exp_year
        tab,
        userId: user._id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Payment method data to save:', paymentMethodData);

      await paymentService.savePaymentMethod(user._id, paymentMethodData);

      // Call success callback
      onSuccess(paymentMethodData);

      // Close modal
      onClose();

      Alert.alert('Success', 'Payment method added successfully!');

    } catch (error) {
      console.error('Error adding payment method:', error);
      Alert.alert('Error', 'Failed to add payment method. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAddDisabled = !formData.cardholderName || !cardDetails?.complete;

  return (
    <Modal visible={visible} onClose={onClose} showTopBar maxHeight="90%">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Payment Method</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Cardholder's Name"
            placeholder="Enter cardholder's name"
            value={formData.cardholderName}
            onChangeText={(value) => handleInputChange('cardholderName', value)}
            error={errors.cardholderName}
            style={styles.compactInput}
          />

          <View style={styles.cardFieldContainer}>
            <Text style={styles.cardFieldLabel}>Card Details</Text>
            <CardField
              postalCodeEnabled={false}
              placeholders={{
                number: '0000 0000 0000 0000',
              }}
              cardStyle={styles.cardField}
              style={styles.cardFieldStyle}
              onCardChange={(cardDetails) => {
                setCardDetails(cardDetails);
              }}
            />
          </View>
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
            title={isLoading ? "Adding..." : "Add"}
            onPress={handleAdd}
            disabled={isAddDisabled || isLoading}
            style={styles.addButton}
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
    paddingHorizontal: theme.spacing.lg,
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
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg
  },
  cancelButton: {},
  addButton: {
    flex: 1,
  },
  cardFieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  cardFieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.gray700,
    marginBottom: theme.spacing.sm,
  },
  cardField: {
    backgroundColor: theme.colors.gray50,
    borderColor: theme.colors.gray200,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    fontSize: 16,
  },
  cardFieldStyle: {
    width: '100%',
    height: 50,
  },
});
