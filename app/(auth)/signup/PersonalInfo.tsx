// app/(auth)/signup/PersonalInfo.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import CheckBox from '@/components/common/CheckBox';
import UserProfileUploader from '@/components/common/UserProfileUploader';
import { useSignupStore } from '@/store/signupStore';
import useAuthStore from '@/store/authStore';
import authService from '@/services/authService';

const GENDER_OPTIONS = [
  { label: 'Female', value: 'F' },
  { label: 'Male', value: 'M' },
  { label: 'Other', value: 'O' }
];

interface FormErrors {
  name?: string;
  surname?: string;
  dob?: string;
  gender?: string;
  email?: string;
  confirmEmail?: string;
  profileImage?: string;
  agreements?: string;
}

export default function PersonalInfoScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const signupStore = useSignupStore();
  const authStore = useAuthStore();
  
  // Form states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);

  const styles = createStyles(theme);

  // Check if user came from phone verification
  useEffect(() => {
    if (!signupStore.verificationId || !signupStore.fullPhoneNumber) {
      Alert.alert('Error', 'Session expired. Please start the signup process again.');
      router.replace('/(auth)/signup/Language');
    }
  }, []);

  const handleBack = () => {
    router.back();
  };

  // Validation functions
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validations
    if (!signupStore.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!signupStore.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!signupStore.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Check if user is at least 13 years old
      const today = new Date();
      const birthDate = new Date(signupStore.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 13 || (age === 13 && monthDiff < 0)) {
        newErrors.dob = 'You must be at least 13 years old';
      }
    }

    if (!signupStore.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    if (!signupStore.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signupStore.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!signupStore.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Email confirmation is required';
    } else if (signupStore.email !== signupStore.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    if (!signupStore.profileImage) {
      newErrors.profileImage = 'Profile photo is required';
    }

    // Agreement validations
    if (!signupStore.agreeTerms || !signupStore.agreePrivacy) {
      newErrors.agreements = 'You must agree to Terms & Conditions and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = async (imageUri: string | null, file?: any) => {
    if (imageUri && file) {
      setIsUploading(true);
      try {
        // Here you would typically upload the image to your server
        // const uploadResponse = await uploadImage(file);
        
        // For now, just simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        signupStore.setPersonalInfo({ profileImage: imageUri });
        
        // Clear any existing error
        if (errors.profileImage) {
          setErrors(prev => ({ ...prev, profileImage: undefined }));
        }
        
        console.log('Image uploaded successfully:', file);
      } catch (error) {
        console.error('Image upload failed:', error);
        Alert.alert('Upload Failed', 'Failed to upload profile photo. Please try again.');
      } finally {
        setIsUploading(false);
      }
    } else {
      // Image was removed
      signupStore.setPersonalInfo({ profileImage: null });
    }
  };

  const updateFormData = (field: keyof typeof signupStore) => (value: any) => {
    signupStore.setPersonalInfo({ [field]: value });
    
    // Clear error when user starts typing/selecting
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const updateAgreement = (field: 'agreeTerms' | 'agreePrivacy' | 'agreeMarketing') => (value: boolean) => {
    signupStore.setAgreements({ [field]: value });
    
    // Clear agreement errors
    if (errors.agreements && (field === 'agreeTerms' || field === 'agreePrivacy')) {
      setErrors(prev => ({ ...prev, agreements: undefined }));
    }
  };

  const handleCompleteSignup = async () => {
    if (!validateForm()) {
      // Show first error
      const firstError = Object.values(errors)[0];
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    if (!signupStore.verificationId) {
      Alert.alert('Error', 'Verification session expired. Please try again.');
      router.replace('/(auth)/signup/PhoneNumber');
      return;
    }

    try {
      signupStore.setSubmitting(true);
      signupStore.setError(null);

      // Complete the phone authentication and create user account
      const userData = {
        displayName: `${signupStore.name} ${signupStore.surname}`,
        role: 'worker' as const,
        name: signupStore.name,
        surname: signupStore.surname,
        dateOfBirth: signupStore.dob?.toISOString(),
        gender: signupStore.gender,
        email: signupStore.email,
        profileImage: signupStore.profileImage,
        agreements: {
          terms: signupStore.agreeTerms,
          privacy: signupStore.agreePrivacy,
          marketing: signupStore.agreeMarketing,
          agreedAt: new Date().toISOString(),
        },
        signupCompletedAt: new Date().toISOString(),
      };

      // This will complete the phone auth and create the user account
      const result = await authService.verifyPhoneCode(
        signupStore.verificationId, 
        '', // We already verified the code in SMS step
        userData
      );

      console.log('Signup completed successfully:', result);
      
      // Clear signup data
      signupStore.reset();

      // The auth store will automatically update via the auth listener
      // Navigate to main app or onboarding
      router.replace('/(tabs)/dashboard');

    } catch (error: any) {
      console.error('Signup completion failed:', error);
      
      let errorMessage = 'Failed to complete signup. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please use a different email.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      signupStore.setError(errorMessage);
      Alert.alert('Signup Failed', errorMessage);
    } finally {
      signupStore.setSubmitting(false);
    }
  };

  const handleTermsPress = () => {
    console.log('Terms & Conditions pressed');
    // router.push('/terms-and-conditions');
  };

  const handlePrivacyPress = () => {
    console.log('Privacy Policy pressed');
    // router.push('/privacy-policy');
  };

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <ContentHeader 
          title='Fill in Personal Info' 
          style={{ marginBottom: theme.spacing.md }} 
        />

        <UserProfileUploader
          label="Profile Photo"
          required
          value={signupStore.profileImage}
          onImageChange={handleImageChange}
          error={errors.profileImage}
          loading={isUploading}
          size={120}
          placeholder="Add your photo"
          style={styles.profileUploader}
        />

        <Input
          label='Name'
          placeholder='Enter your name'
          value={signupStore.name}
          onChangeText={updateFormData('name')}
          error={errors.name}
          required
          style={styles.input}
        />

        <Input
          label='Surname'
          placeholder='Enter your surname'
          value={signupStore.surname}
          onChangeText={updateFormData('surname')}
          error={errors.surname}
          required
          style={styles.input}
        />

        <Input
          label='Date of Birth'
          placeholder='Select date of birth'
          type='date'
          value={signupStore.dob}
          onDateTimeChange={updateFormData('dob')}
          error={errors.dob}
          required
          maximumDate={new Date()}
          minimumDate={new Date('1900-01-01')}
          style={styles.input}
        />

        <Select
          label="Gender"
          placeholder='Select gender'
          options={GENDER_OPTIONS}
          value={signupStore.gender as string}
          onSelectionChange={updateFormData('gender')}
          error={errors.gender}
          required
          style={styles.input}
        />

        <Input
          label='Email'
          placeholder='Enter your email'
          value={signupStore.email}
          onChangeText={updateFormData('email')}
          error={errors.email}
          required
          keyboardType='email-address'
          autoCapitalize='none'
          style={styles.input}
        />

        <Input
          label='Confirm Email'
          placeholder='Confirm your email'
          value={signupStore.confirmEmail}
          onChangeText={updateFormData('confirmEmail')}
          error={errors.confirmEmail}
          required
          keyboardType='email-address'
          autoCapitalize='none'
          style={styles.input}
        />

        <View style={styles.spacer} />

        {/* CheckBox Section */}
        <View style={styles.checkboxSection}>
          {/* Terms & Conditions CheckBox */}
          <CheckBox
            checked={signupStore.agreeTerms}
            onPress={() => updateAgreement('agreeTerms')(!signupStore.agreeTerms)}
            theme={theme}
            style={styles.checkboxItem}
          >
            <View style={styles.checkboxLabelWrap}>
              <Text style={styles.checkboxLabel}>
                I agree with{' '}
              </Text>
              <TouchableOpacity onPress={handleTermsPress}>
                <Text style={styles.linkText}>Terms & Conditions</Text>
              </TouchableOpacity>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
          </CheckBox>

          {/* Privacy Policy CheckBox */}
          <CheckBox
            checked={signupStore.agreePrivacy}
            onPress={() => updateAgreement('agreePrivacy')(!signupStore.agreePrivacy)}
            theme={theme}
            style={styles.checkboxItem}
          >
            <View style={styles.checkboxLabelWrap}>
              <Text style={styles.checkboxLabel}>
                I agree with{' '}
              </Text>
              <TouchableOpacity onPress={handlePrivacyPress}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.requiredAsterisk}> *</Text>
            </View>
          </CheckBox>

          {/* Marketing Communications CheckBox */}
          <CheckBox
            checked={signupStore.agreeMarketing}
            onPress={() => updateAgreement('agreeMarketing')(!signupStore.agreeMarketing)}
            theme={theme}
            style={styles.checkboxItem}
          >
            <View style={styles.checkboxLabelWrap}>
              <Text style={styles.checkboxLabel}>
                I agree to receive discounts, promotions and marketing communications
              </Text>
            </View>
          </CheckBox>

          {/* Agreement Error */}
          {errors.agreements && (
            <Text style={styles.errorText}>{errors.agreements}</Text>
          )}
        </View>

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <Button 
            variant="outline" 
            title="Cancel" 
            onPress={handleBack} 
            disabled={signupStore.isSubmitting || isUploading}
          />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title={signupStore.isSubmitting ? "Creating Account..." : "Complete Signup"}
              onPress={handleCompleteSignup}
              loading={signupStore.isSubmitting}
              disabled={isUploading}
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
  profileUploader: {
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  spacer: {
    flex: 1,
  },
  checkboxSection: {
    marginBottom: theme.spacing.lg,
  },
  checkboxItem: {
    marginBottom: theme.spacing.md,
  },
  checkboxLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  checkboxLabel: {
    fontSize: 14,
    color: theme.colors.gray700 || '#374151',
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.blue500 || '#3B82F6',
    textDecorationLine: 'underline',
    fontSize: 14,
    lineHeight: 20,
  },
  requiredAsterisk: {
    color: theme.colors.error,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  bottomContainer: {
    flexDirection: 'row',
  },
});