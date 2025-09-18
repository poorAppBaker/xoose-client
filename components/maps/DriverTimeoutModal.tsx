import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';

const errorIcon = require('../../assets/images/icons/Error.png');

interface DriverTimeoutModalProps {
  visible: boolean;
  onContinue: () => void;
}

export default function DriverTimeoutModal({
  visible,
  onContinue,
}: DriverTimeoutModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Error Icon */}
      <View style={styles.iconContainer}>
        <Image source={errorIcon} style={styles.icon} />
      </View>

      {/* Message */}
      <Text style={styles.message}>The time for driver acceptance has expired.</Text>
      <Text style={styles.subMessage}>Please select another driver.</Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: 40, // Account for safe area
    alignItems: 'center',
    ...theme.shadows.lg,
  },
  iconContainer: {
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: theme.spacing.lg,
    resizeMode: 'contain',
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    lineHeight: 24,
  },
  subMessage: {
    fontSize: 16,
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  continueButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
