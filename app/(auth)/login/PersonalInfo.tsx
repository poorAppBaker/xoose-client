import React, { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Checkbox from '@/components/common/CheckBox'; // Import the new Checkbox component

const GENDER_OPTIONS = [
  { label: 'Female', value: 'F' },
  { label: 'Male', value: 'M' },
  { label: 'Other', value: 'O' }
];

export default function PersonalInfoScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  
  // Checkbox states
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeMarketing, setAgreeMarketing] = useState(false);

  const handleBack = () => {
    router.back();
  }

  const handleContinue = () => {
    router.push('/(auth)/login/PhoneNumber');
  }

  const handleTermsPress = () => {
    // Handle terms & conditions link press
    // You can navigate to terms screen or open a modal
    console.log('Terms & Conditions pressed');
    // Example: router.push('/terms-and-conditions');
  }

  const handlePrivacyPress = () => {
    // Handle privacy policy link press
    // You can navigate to privacy policy screen or open a modal
    console.log('Privacy Policy pressed');
    // Example: router.push('/privacy-policy');
  }

  const styles = createStyles(theme);

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <ContentHeader title='Fill in Personal Info' />

        <Input
          label='Name'
          placeholder='Enter your name'
          value={name}
          onChangeText={setName}
          style={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label='Surname'
          placeholder='Enter your surname'
          value={surname}
          onChangeText={setSurname}
          style={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label='Date of Birth'
          placeholder='Select date of birth'
          type='date'
          value={dob}
          onDateTimeChange={setDob}
          style={{ marginBottom: theme.spacing.md }}
        />

        <Select
          label="Gender"
          placeholder='Select gender'
          options={GENDER_OPTIONS}
          value={gender as string}
          onSelectionChange={(v) => setGender(v as string)}
          style={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label='Email'
          placeholder='Enter your email'
          value={email}
          onChangeText={setEmail}
          keyboardType='email-address'
          style={{ marginBottom: theme.spacing.md }}
        />

        <Input
          label='Confirm Email'
          placeholder='Confirm your email'
          value={confirmEmail}
          onChangeText={setConfirmEmail}
          style={{ marginBottom: theme.spacing.md }}
        />

        <View style={styles.spacer} />

        {/* Checkbox Section */}
        <View style={styles.checkboxSection}>
          <Checkbox
            checked={agreeTerms}
            onPress={() => setAgreeTerms(!agreeTerms)}
            label="I agree with Terms & Conditions"
            theme={theme}
            onLinkPress={handleTermsPress}
          />
          
          <Checkbox
            checked={agreePrivacy}
            onPress={() => setAgreePrivacy(!agreePrivacy)}
            label="I agree with Privacy Policy"
            theme={theme}
            onLinkPress={handlePrivacyPress}
          />
          
          <Checkbox
            checked={agreeMarketing}
            onPress={() => setAgreeMarketing(!agreeMarketing)}
            label="I agree to receive discounts, promotions and marketing communications"
            theme={theme}
          />
        </View>

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <Button variant="outline" title="Cancel" onPress={handleBack} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title="Continue"
              onPress={handleContinue}
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
  checkboxSection: {
    marginBottom: theme.spacing.lg,
  },
  codeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  timeoutText: {
    fontSize: 12,
    fontWeight: 400,
  },
  resendText: {
    fontWeight: 700,
    fontSize: 14,
    color: theme.colors.gray300,
  },
  resendActive: {
    color: theme.colors.blue500,
  },
  bottomContainer: {
    flexDirection: 'row',
  },
});