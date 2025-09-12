import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import PhoneNumberInput from '../common/PhoneNumberInput';

interface WhoWillTakeTripModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (tripTaker: 'myself' | 'someone', personDetails?: { name: string; phone?: string }) => void;
}

export default function WhoWillTakeTripModal({
  visible,
  onClose,
  onSelect
}: WhoWillTakeTripModalProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const [selectedOption, setSelectedOption] = useState<'myself' | 'someone'>('myself');
  const [personName, setPersonName] = useState('Jane');
  const [phoneNumber, setPhoneNumber] = useState('+351 95 000 00 00');

  const handleSelect = () => {
    if (selectedOption === 'myself') {
      onSelect('myself');
    } else {
      onSelect('someone', { name: personName, phone: phoneNumber });
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      maxHeight="80%"
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.blue500} />
        </TouchableOpacity>
        <Text style={styles.title}>Who Will Take the Trip?</Text>
        <View style={styles.placeholder} />
      </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.option}
            onPress={() => setSelectedOption('myself')}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radio,
                selectedOption === 'myself' && styles.radioSelected
              ]}>
                {selectedOption === 'myself' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.optionText}>Myself</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => setSelectedOption('someone')}
          >
            <View style={styles.radioContainer}>
              <View style={[
                styles.radio,
                selectedOption === 'someone' && styles.radioSelected
              ]}>
                {selectedOption === 'someone' && <View style={styles.radioInner} />}
              </View>
            </View>
            <Text style={styles.optionText}>Trip for someone</Text>
          </TouchableOpacity>
        </View>

        {/* Person Details - Only show if "Trip for someone" is selected */}
        {selectedOption === 'someone' && (
          <View style={styles.personDetailsContainer}>
            <Text style={styles.sectionTitle}>Person's Details</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name of Person</Text>
              <TextInput
                style={styles.textInput}
                value={personName}
                onChangeText={setPersonName}
                placeholder="Enter person's name"
                placeholderTextColor={theme.colors.gray400}
              />
            </View>

            <View style={styles.inputContainer}>
              <PhoneNumberInput
                label="Phone Number (optional)"
                value={phoneNumber}
                onChangeText={(fullPhoneNumber) => setPhoneNumber(fullPhoneNumber)}
                placeholder="Phone number"
                defaultCountry="PT"
              />
            </View>
          </View>
        )}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.selectButton} onPress={handleSelect}>
          <Text style={styles.selectButtonText}>Select</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    ...theme.typography.h3,
    color: theme.colors.gray600,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  optionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  radioContainer: {
    marginRight: theme.spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.gray300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: theme.colors.blue500,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.blue500,
  },
  optionText: {
    ...theme.typography.body,
    color: theme.colors.gray600,
    fontWeight: '500',
  },
  personDetailsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray200,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.gray600,
    fontWeight: 'bold',
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    ...theme.typography.bodySmall,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
  },
  textInput: {
    ...theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.gray200,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.gray50,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    ...theme.typography.button,
    color: theme.colors.blue500,
  },
  selectButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.blue500,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  selectButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
});
