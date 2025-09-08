import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import DefaultLayout from '@/components/layout/DefaultLayout';
import Button from '@/components/common/Button';
import useAuthStore from '@/store/authStore';

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { markFirstLaunchComplete } = useAuthStore();

  const styles = createStyles(theme);

  const handleGetStarted = async () => {
    await markFirstLaunchComplete();
    router.push('/(auth)/signup/Language');
  };

  const handleSignIn = async () => {
    await markFirstLaunchComplete();
    router.push('/(auth)/login');
  };

  return (
    <DefaultLayout scrollable>
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/xoose-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.taglineText}>The price. The car. The Driver</Text>
          <Text style={styles.chooseText}>YOU CHOOSE</Text>
        </View>

        <View style={styles.spacer} />

        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            fullWidth
            title="Get Started"
            onPress={handleGetStarted}
            style={styles.primaryButton}
            textStyle={styles.primaryButtonText}
          />
          
          <Button
            variant="outline"
            fullWidth
            title="Sign In"
            onPress={handleSignIn}
            style={styles.secondaryButton}
            textStyle={styles.secondaryButtonText}
          />
        </View>
      </View>
    </DefaultLayout>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primary,
  },
  spacer: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    height: 80,
    width: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  taglineText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '400',
  },
  chooseText: {
    fontSize: 32,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
  },
  primaryButtonText: {
    color: theme.colors.primary,
  },
  secondaryButton: {
    borderColor: '#ffffff',
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: '#ffffff',
  },
});