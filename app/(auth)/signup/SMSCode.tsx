// app/(auth)/signup/SMSCode.tsx
import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import CodeInput, { CodeInputRef } from '@/components/common/CodeInput';
import { useSignupStore } from '@/store/signupStore';
import authService from '@/services/authService';

export default function SMSCodeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const signupStore = useSignupStore();
  const codeInputRef = useRef<CodeInputRef>(null);
  
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const styles = createStyles(theme);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Check if we have verification ID, if not redirect back
  useEffect(() => {
    if (!signupStore.verificationId) {
      Alert.alert('Error', 'No verification code was sent. Please try again.');
      router.replace('/(auth)/signup/PhoneNumber');
    }
  }, [signupStore.verificationId]);

  const handleBack = () => {
    router.back();
  };

  const handleCodeChange = (text: string) => {
    setCode(text);
    signupStore.setError(null);
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit code');
      return;
    }

    if (!signupStore.verificationId) {
      Alert.alert('Error', 'Verification session expired. Please request a new code.');
      router.replace('/(auth)/signup/PhoneNumber');
      return;
    }

    try {
      signupStore.setVerifyingCode(true);
      signupStore.setError(null);

      // Note: We don't actually sign in yet, just verify the code is valid
      // We'll complete the signup in the PersonalInfo screen
      await authService.verifyPhoneCode(signupStore.verificationId, code, {
        role: 'worker' // Default role, can be changed later
      });

      // If verification succeeds, navigate to PersonalInfo
      router.push('/(auth)/signup/PersonalInfo');

    } catch (error: any) {
      console.error('Code verification failed:', error);
      
      let errorMessage = 'Invalid verification code. Please try again.';
      
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code. Please check and try again.';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'Verification code has expired. Please request a new one.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      signupStore.setError(errorMessage);
      Alert.alert('Verification Failed', errorMessage);
      
      // Clear the code input on error
      codeInputRef.current?.clear();
      setCode('');
      
    } finally {
      signupStore.setVerifyingCode(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || !signupStore.fullPhoneNumber) return;

    try {
      signupStore.setSendingCode(true);
      signupStore.setError(null);
      
      // Reinitialize reCAPTCHA and send new code
      authService.initializeRecaptcha();
      const newVerificationId = await authService.signInWithPhoneNumber(signupStore.fullPhoneNumber);
      signupStore.setVerificationId(newVerificationId);
      
      // Reset timer and code
      setTimeLeft(60);
      setCanResend(false);
      codeInputRef.current?.clear();
      setCode('');
      
      Alert.alert('Success', 'New verification code sent successfully');
      
    } catch (error: any) {
      console.error('Failed to resend code:', error);
      
      let errorMessage = 'Failed to resend code. Please try again.';
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please wait before requesting a new code.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      signupStore.setSendingCode(false);
    }
  };

  const handleCodeComplete = (enteredCode: string) => {
    setCode(enteredCode);
    // Auto-verify when code is complete
    if (enteredCode.length === 6) {
      setTimeout(() => handleVerifyCode(), 300);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple formatting for display
    if (phone.startsWith('+1')) {
      return phone.replace(/(\+1)(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
    }
    return phone;
  };

  return (
    <DefaultLayout scrollable showKeyboardAvoidance={false}>
      <View style={styles.container}>
        {/* Hidden reCAPTCHA container for resend */}
        <View id="recaptcha-container" style={{ height: 0, overflow: 'hidden' }} />
        
        <ContentHeader title='Enter SMS Code' />

        <Text style={styles.description}>
          We sent a verification code to{' '}
          <Text style={styles.phoneText}>
            {formatPhoneNumber(signupStore.fullPhoneNumber)}
          </Text>
          {'. Enter the code below to continue.'}
        </Text>

        <CodeInput
          ref={codeInputRef}
          numberOfDigits={6}
          onCodeComplete={handleCodeComplete}
          onCodeChange={handleCodeChange}
          autoFocus={true}
          placeholder="•"
        />

        <View style={styles.codeActionsContainer}>
          <Text style={styles.timeoutText}>
            {canResend ? (
              'You can resend the code now'
            ) : (
              <>You can resend the code in <Text style={styles.timerText}>{timeLeft}</Text> seconds</>
            )}
          </Text>

          <TouchableOpacity 
            onPress={handleResendCode} 
            disabled={!canResend || signupStore.isSendingCode}
          >
            <Text style={[
              styles.resendText,
              (canResend && !signupStore.isSendingCode) && styles.resendActive,
              signupStore.isSendingCode && styles.resendLoading
            ]}>
              {signupStore.isSendingCode ? 'Sending...' : 'Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spacer} />

        <View style={styles.bottomContainer}>
          <Button 
            variant="outline" 
            title="Cancel" 
            onPress={handleBack}
            disabled={signupStore.isVerifyingCode}
          />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title={signupStore.isVerifyingCode ? "Verifying..." : "Continue"}
              onPress={handleVerifyCode}
              disabled={code.length < 6 || signupStore.isVerifyingCode}
              loading={signupStore.isVerifyingCode}
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
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
  phoneText: {
    fontWeight: '600',
    color: theme.colors.gray800,
  },
  spacer: {
    flex: 1,
  },
  codeActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
    flexWrap: 'wrap',
  },
  timeoutText: {
    fontSize: 12,
    fontWeight: '400',
    color: theme.colors.gray500,
    flex: 1,
  },
  timerText: {
    fontWeight: '700',
    color: theme.colors.gray800,
  },
  resendText: {
    fontWeight: '700',
    fontSize: 14,
    color: theme.colors.gray300,
  },
  resendActive: {
    color: theme.colors.blue500,
  },
  resendLoading: {
    color: theme.colors.gray400,
  },
  bottomContainer: {
    flexDirection: 'row',
  },
});