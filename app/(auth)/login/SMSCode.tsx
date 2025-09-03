import React, { useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import PhoneNumberInput, { Country } from '@/components/common/PhoneNumberInput';
import ContentHeader from '@/components/common/ContentHeader';
import CodeInput, { CodeInputRef } from '@/components/common/CodeInput';

export default function SMSCodeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const codeInputRef = useRef<CodeInputRef>(null);
  const [code, setCode] = React.useState('');


  const handleBack = () => {
    router.back();
  }

  const handleContainue = () => {
    router.push('/(auth)/login/PersonalInfo');
  }

  const handleCodeChange = (text: string) => {
    console.log('Code changed:', text);
    setCode(text);
  };

  const handleCodeComplete = (enteredCode: string) => {
    console.log('Code completed:', enteredCode);
  };

  const clearCode = () => {
    codeInputRef.current?.clear();
    setCode('');
  };

  const focusInput = () => {
    codeInputRef.current?.focus();
  };

  const setTestCode = () => {
    codeInputRef.current?.setValue('123456');
    setCode('123456');
  };

  const styles = createStyles(theme);

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <ContentHeader title='Enter SMS Code' />

        <Text style={styles.description}>Check your messages. We sent you a one-time code. Insert the code above to continue.</Text>

        <CodeInput
          ref={codeInputRef}
          numberOfDigits={6}
          onCodeComplete={handleCodeComplete}
          onCodeChange={handleCodeChange}
          autoFocus={true}
          placeholder="•"
        />

        <View style={styles.codeActionsContainer}>
          <Text style={styles.timeoutText}>You can resend the code in <Text style={{ fontWeight: 700 }}>59</Text> seconds</Text>

          <TouchableOpacity onPress={() => { /* Resend code logic here */ }}>
            <Text style={[styles.resendText, code.length == 3 && styles.resendActive]}>Resend Code</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        {/* Footer Buttons */}
        <View style={styles.bottomContainer}>
          <Button variant="outline" title="Cancel" onPress={handleBack} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title="Continue"
              onPress={handleContainue}
              disabled={code.length < 6}
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
  description: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  spacer: {
    flex: 1,
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