import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface LocationItem {
  id: string;
  title: string;
  subtitle: string;
  latitude?: number;
  longitude?: number;
}

interface ConfirmPickupModalProps {
  visible: boolean;
  pickup: LocationItem | null;
  onBack: () => void;
  onContinue: () => void;
  onClose: () => void;
  onEdit?: () => void;
}

export default function ConfirmPickupModal({ 
  visible, 
  pickup, 
  onBack, 
  onContinue, 
  onClose,
  onEdit
}: ConfirmPickupModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  if (!visible || !pickup) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Pickup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Pickup Input */}
      <View style={styles.pickupSection}>
        <Text style={styles.pickupLabel}>Pickup</Text>
        <View style={styles.pickupInputContainer}>
          <TouchableOpacity 
            style={styles.pickupInput}
            onPress={onEdit}
          >
            <View style={styles.pickupInputContent}>
              <Ionicons name="location-outline" size={20} color="#007AFF" />
              <Text style={styles.pickupText}>{pickup.title}</Text>
              <View style={styles.mapSection}>
                <Ionicons name="map-outline" size={20} color="#007AFF" />
                <Text style={styles.mapText}>Map</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.backActionButton} onPress={onBack}>
          <Text style={styles.backActionButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.continueButton} onPress={onContinue}>
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 40, // Account for safe area
    ...theme.shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
  },
  pickupSection: {
    marginBottom: theme.spacing.xl,
  },
  pickupLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    fontWeight: '500',
  },
  pickupInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flex: 1,
    ...theme.shadows.sm,
  },
  pickupInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickupText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 12,
  },
  mapSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backActionButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: '#FFFFFF',
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  backActionButtonText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.blue500,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
