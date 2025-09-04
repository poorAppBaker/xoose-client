import React, { useRef, useState } from 'react';
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

const GENDER_OPTIONS = [
  { label: 'Female', value: 'F' },
  { label: 'Male', value: 'M' },
  { label: 'Other', value: 'O' }
];

interface FormData {
  name: string;
  surname: string;
  dob: Date | null;
  gender: string | null;
  email: string;
  confirmEmail: string;
  profileImage: string | null;
}

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
  
  // Form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    surname: '',
    dob: null,
    gender: null,
    email: '',
    confirmEmail: '',
    profileImage: null,
  });

  // CheckBox states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  // Form states
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.surname.trim()) {
      newErrors.surname = 'Surname is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Check if user is at least 13 years old
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (age < 13 || (age === 13 && monthDiff < 0)) {
        newErrors.dob = 'You must be at least 13 years old';
      }
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender selection is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Email confirmation is required';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    if (!formData.profileImage) {
      newErrors.profileImage = 'Profile photo is required';
    }

    // Agreement validations
    if (!agreeTerms || !agreePrivacy) {
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
        
        setFormData(prev => ({ ...prev, profileImage: imageUri }));
        
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
      setFormData(prev => ({ ...prev, profileImage: null }));
    }
  };

  const updateFormData = (field: keyof FormData) => (value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContinue = async () => {
    if (!validateForm()) {
      // Show first error
      const firstError = Object.values(errors)[0];
      if (firstError) {
        Alert.alert('Validation Error', firstError);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would submit the form data to your backend
      console.log('Submitting form data:', {
        ...formData,
        agreements: {
          terms: agreeTerms,
          privacy: agreePrivacy,
          marketing: agreeMarketing
        }
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      router.push('/(auth)/login/PhoneNumber');
    } catch (error) {
      console.error('Form submission failed:', error);
      Alert.alert('Error', 'Failed to save information. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  const styles = createStyles(theme);

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
          value={formData.profileImage}
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
          value={formData.name}
          onChangeText={updateFormData('name')}
          error={errors.name}
          required
          style={styles.input}
        />

        <Input
          label='Surname'
          placeholder='Enter your surname'
          value={formData.surname}
          onChangeText={updateFormData('surname')}
          error={errors.surname}
          required
          style={styles.input}
        />

        <Input
          label='Date of Birth'
          placeholder='Select date of birth'
          type='date'
          value={formData.dob}
          onDateTimeChange={updateFormData('dob')}
          error={errors.dob}
          required
          maximumDate={new Date()} // Can't select future dates
          minimumDate={new Date('1900-01-01')} // Reasonable minimum date
          style={styles.input}
        />

        <Select
          label="Gender"
          placeholder='Select gender'
          options={GENDER_OPTIONS}
          value={formData.gender as string}
          onSelectionChange={updateFormData('gender')}
          error={errors.gender}
          required
          style={styles.input}
        />

        <Input
          label='Email'
          placeholder='Enter your email'
          value={formData.email}
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
          value={formData.confirmEmail}
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
            checked={agreeTerms}
            onPress={() => {
              setAgreeTerms(!agreeTerms);
              if (errors.agreements) {
                setErrors(prev => ({ ...prev, agreements: undefined }));
              }
            }}
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
            checked={agreePrivacy}
            onPress={() => {
              setAgreePrivacy(!agreePrivacy);
              if (errors.agreements) {
                setErrors(prev => ({ ...prev, agreements: undefined }));
              }
            }}
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
            checked={agreeMarketing}
            onPress={() => setAgreeMarketing(!agreeMarketing)}
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
            disabled={isSubmitting || isUploading}
          />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title={isSubmitting ? "Saving..." : "Continue"}
              onPress={handleContinue}
              loading={isSubmitting}
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