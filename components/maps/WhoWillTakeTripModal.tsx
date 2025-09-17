import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import Modal from '../common/Modal';
import PhoneNumberInput from '../common/PhoneNumberInput';
import Input from '@/components/common/Input';

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
    onSelect(selectedOption, { name: personName, phone: phoneNumber });
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

      {/* Person Details - Always visible */}
      <View style={styles.personDetailsContainer}>
        <Text style={styles.sectionTitle}>Person's Details</Text>

        <View style={styles.inputContainer}>
          <Input
            label="Name of Person"
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
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  placeholder: {
    width: 40,
  },
  optionsContainer: {
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
    fontSize: 16,
    color: theme.colors.black,
    fontWeight: '500',
  },
  personDetailsContainer: {
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.gray500,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  textInput: {
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  cancelButton: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: 45,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.blue500,
    backgroundColor: theme.colors.white,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.blue500,
    fontWeight: '600',
  },
  selectButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.blue500,
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: '600',
  },
});
