import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { theme } from '@/constants/theme';

interface CancelRideModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (reason: string, customReason?: string) => void;
}

const cancellationReasons = [
  'Driver behavior',
  'Problem with the car',
  'I am not in the car',
  'Driver asked me to cancel',
  'Different route than expected',
  'Trip taking too much time',
  'I changed my mind',
];

export default function CancelRideModal({
  visible,
  onClose,
  onConfirm,
}: CancelRideModalProps) {
  const { theme } = useTheme();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!visible) {
    return null;
  }

  const handleReasonSelect = (reason: string) => {
    if (reason === 'Other') {
      setShowCustomInput(true);
      setSelectedReason('Other');
    } else {
      setShowCustomInput(false);
      setSelectedReason(reason);
      setCustomReason('');
    }
  };

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason, showCustomInput ? customReason : undefined);
      // Reset state
      setSelectedReason('');
      setCustomReason('');
      setShowCustomInput(false);
    }
  };

  const handleBack = () => {
    onClose();
    // Reset state
    setSelectedReason('');
    setCustomReason('');
    setShowCustomInput(false);
  };

  const isContinueEnabled = selectedReason && (!showCustomInput || customReason.trim().length > 0);

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
          </TouchableOpacity>
          <Text style={styles.title}>Select the Reason of Canceling</Text>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Cancellation Reasons */}
          {cancellationReasons.map((reason, index) => (
            <TouchableOpacity
              key={index}
              style={styles.reasonItem}
              onPress={() => handleReasonSelect(reason)}
            >
              <View style={styles.checkboxContainer}>
                <View style={[
                  styles.checkbox,
                  selectedReason === reason && styles.checkboxSelected
                ]}>
                  {selectedReason === reason && (
                    <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                  )}
                </View>
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {/* Other Option */}
          <TouchableOpacity
            style={styles.reasonItem}
            onPress={() => handleReasonSelect('Other')}
          >
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                selectedReason === 'Other' && styles.checkboxSelected
              ]}>
                {selectedReason === 'Other' && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.white} />
                )}
              </View>
            </View>
            <Text style={styles.reasonText}>Other</Text>
          </TouchableOpacity>

          {/* Custom Reason Input */}
          <View style={styles.customInputContainer}>
            <TextInput
              style={styles.customInput}
              placeholder="Enter the reason"
              placeholderTextColor={theme.colors.gray400}
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={5}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.backButtonAction} onPress={handleBack}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isContinueEnabled && styles.continueButtonDisabled
            ]}
            onPress={handleConfirm}
            disabled={!isContinueEnabled}
          >
            <Text style={[
              styles.continueButtonText,
              !isContinueEnabled && styles.continueButtonTextDisabled
            ]}>
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  reasonText: {
    fontSize: 16,
    color: '#000000',
  },
  customInputContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  customInput: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 15,
  },
  backButtonAction: {
    paddingHorizontal: 45,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  continueButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D0D0D0',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: '#A0A0A0',
  },
});
