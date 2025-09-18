import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '../../constants/theme';

interface DriverAcceptedModalProps {
  visible: boolean;
  onContinue: () => void;
  onShowDriverArriving: () => void;
}

export default function DriverAcceptedModal({
  visible,
  onContinue,
  onShowDriverArriving,
}: DriverAcceptedModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark" size={40} color="white" />
      </View>

      {/* Message */}
      <Text style={styles.message}>The driver accepted your trip request.</Text>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={onShowDriverArriving}>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  message: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    lineHeight: 24,
  },
  continueButton: {
    width: '100%',
    backgroundColor: '#00BFFF',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    minWidth: 200,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
