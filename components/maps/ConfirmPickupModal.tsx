import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Input from '@/components/common/Input';
import Modal from '@/components/common/Modal';

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

  if (!pickup) return null;

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      maxHeight="70%"
      showTopBar={true}
      backdropOpacity={0}
      containerStyle={{ gap: theme.spacing.sm }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Confirm Pickup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Input Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Input
              label={'Pickup'}
              placeholder="Enter your pickup point"
              placeholderTextColor="#121212"
              value={pickup.title}
              onFocus={onEdit}
              leftIcon={<Image source={require('@/assets/images/locationIcon.png')} />}
              style={styles.searchInput}
            />
            <View style={styles.headerRight}>
              <Image source={require('@/assets/images/map.png')} />
              <Text style={styles.headerMapText}>Map</Text>
            </View>
          </View>
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
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
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
  searchSection: {
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  searchInputWrapper: {
    flex: 1,
    marginRight: theme.spacing.md,
    flexDirection: 'row',
  },
  searchInput: {
    marginBottom: 0,
    backgroundColor: '#FFFFFF',
    flex: 1,
    height: 48,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 22,
    top: 0,
    bottom: 0,
  },
  headerMapText: {
    ...theme.typography.body,
    color: theme.colors.blue500,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backActionButton: {
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: '#FFFFFF',
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    paddingHorizontal: 45,
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
