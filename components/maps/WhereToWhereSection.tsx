import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface LocationItem {
  coordinate: [number, number];
  title: string;
  subtitle: string;
}

interface WhereToWhereSectionProps {
  pickup?: LocationItem | null;
  destination?: LocationItem | null;
  onPickupPress: () => void;
  onDestinationPress: () => void;
  onAddStop: () => void;
}

export default function WhereToWhereSection({
  pickup,
  destination,
  onPickupPress,
  onDestinationPress,
  onAddStop
}: WhereToWhereSectionProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {/* Pickup Input */}
      <TouchableOpacity style={styles.inputContainer} onPress={onPickupPress}>
        <View style={styles.inputIcon}>
          <View style={styles.pickupIcon} />
        </View>
        <View style={styles.inputContent}>
          <Text style={styles.inputLabel}>From</Text>
          <Text style={styles.inputText}>
            {pickup ? pickup.title : 'Pickup location'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
      </TouchableOpacity>

      {/* Destination Input */}
      <TouchableOpacity style={styles.inputContainer} onPress={onDestinationPress}>
        <View style={styles.inputIcon}>
          <View style={styles.destinationIcon} />
        </View>
        <View style={styles.inputContent}>
          <Text style={styles.inputLabel}>To</Text>
          <Text style={styles.inputText}>
            {destination ? destination.title : 'Destination'}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={theme.colors.gray400} />
      </TouchableOpacity>

      {/* Add Stop Button */}
      <TouchableOpacity style={styles.addStopButton} onPress={onAddStop}>
        <Ionicons name="add" size={20} color={theme.colors.white} />
        <Text style={styles.addStopText}>Add Stop</Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60, // Below the header
    left: 0,
    right: 0,
    paddingHorizontal: theme.spacing.lg,
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  inputIcon: {
    width: 20,
    height: 20,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF9800', // Orange for pickup
  },
  destinationIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50', // Green for destination
  },
  inputContent: {
    flex: 1,
  },
  inputLabel: {
    ...theme.typography.caption,
    color: theme.colors.gray500,
    marginBottom: 2,
  },
  inputText: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  addStopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.blue500,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  addStopText: {
    ...theme.typography.body,
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
});
