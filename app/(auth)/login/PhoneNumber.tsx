// app/(auth)/signup/PhoneNumber.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import PhoneNumberInput, { Country } from '@/components/common/PhoneNumberInput';
import ContentHeader from '@/components/common/ContentHeader';
import { useSignupStore } from '@/store/signupStore';
import authService from '@/services/authService';

export default function PhoneNumberScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const signupStore = useSignupStore();
  
  const [phone, setPhone] = useState(signupStore.phoneNumber);
  const [fullPhone, setFullPhone] = useState(signupStore.fullPhoneNumber);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(signupStore.selectedCountry);

  const styles = createStyles(theme);

  // Note: reCAPTCHA is handled automatically by React Native Firebase

  const handleBack = () => {
    router.back();
  };

  const handleSendCode = async () => {
    if (!fullPhone.trim() || !selectedCountry) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    try {
      signupStore.setSendingCode(true);
      signupStore.setError(null);
      
      // Save phone number data to store
      signupStore.setPhoneNumber(phone, fullPhone, selectedCountry);
      
      // Send verification code
      const verificationId = await authService.signInWithPhoneNumber(fullPhone);
      signupStore.setVerificationId(verificationId);
      
      // Navigate to SMS code screen
      router.push('/(auth)/login/SMSCode');
      
    } catch (error: any) {
      console.error('Failed to send SMS:', error);
      
      let errorMessage = 'Failed to send verification code. Please try again.';
      
      // Handle specific Firebase errors
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Phone authentication is not enabled.';
      }
      
      signupStore.setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      signupStore.setSendingCode(false);
    }
  };

  const handlePhoneChange = (fullPhoneNumber: string, nationalNumber: string, country: Country) => {
    setPhone(nationalNumber);
    setFullPhone(fullPhoneNumber);
    setSelectedCountry(country);
    
    // Clear any existing errors
    if (signupStore.error) {
      signupStore.setError(null);
    }
  };

  const isValidPhone = phone.length > 0 && selectedCountry && fullPhone.length > 0;

  return (
    <DefaultLayout scrollable showKeyboardAvoidance={false}>
      <View style={styles.container}>
        {/* reCAPTCHA handled automatically by React Native Firebase */}
        
        <ContentHeader title='Enter Your Phone Number' />

        <PhoneNumberInput
          label="Phone"
          placeholder="Enter your phone"
          defaultCountry={selectedCountry?.code || "US"}
          value={phone}
          onChangeText={handlePhoneChange}
          style={{ marginTop: theme.spacing.lg + theme.spacing.xs }}
          error={signupStore.error || undefined}
        />

        <View style={styles.spacer} />

        <View style={styles.bottomContainer}>
          <Button 
            variant="outline" 
            title="Cancel" 
            onPress={handleBack}
            disabled={signupStore.isSendingCode}
          />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title={signupStore.isSendingCode ? "Sending..." : "Send Code"}
              onPress={handleSendCode}
              disabled={!isValidPhone || signupStore.isSendingCode}
              loading={signupStore.isSendingCode}
            />
          </View>
        </View>
      </View>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
  },
  spacer: {
    flex: 1,
  },
  bottomContainer: {
    flexDirection: 'row',
  }
});