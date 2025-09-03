// components/common/Input.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, Platform, ViewStyle, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';

type BaseInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;

interface InputProps extends BaseInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  type?: 'text' | 'password' | 'date' | 'time' | 'datetime';
  value?: string | Date;
  onChangeText?: (text: string) => void;
  onDateTimeChange?: (date: Date) => void;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  required = false,
  type = 'text',
  value,
  onDateTimeChange,
  style,
  onChangeText,
  minimumDate = new Date('1900-1-1'),
  maximumDate = new Date(),
  ...props
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const styles = createStyles(theme);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleDateTimePress = () => {
    if (type === 'date' || type === 'time' || type === 'datetime') {
      // Initialize temp date with current value or default
      const currentValue = value ? (typeof value === 'string' ? new Date(value) : value) : new Date();
      setTempDate(currentValue);
      setShowDatePicker(true);
    }
  };

  // Date/Time change handlers
  const handleDateTimeChange = useCallback((event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate && onDateTimeChange) {
        onDateTimeChange(selectedDate);
      }
    } else {
      // iOS: Only update temp date, don't close modal yet
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  }, [onDateTimeChange]);

  const handleDatePickerConfirm = useCallback(() => {
    // iOS: Apply the temp date and close modal
    if (onDateTimeChange) {
      onDateTimeChange(tempDate);
    }
    setShowDatePicker(false);
  }, [tempDate, onDateTimeChange]);

  const handleDatePickerCancel = useCallback(() => {
    // iOS: Close modal without applying changes
    setShowDatePicker(false);
  }, []);

  const formatDateValue = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (type === 'date') {
      return dateObj.toLocaleDateString();
    } else if (type === 'time') {
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (type === 'datetime') {
      return dateObj.toLocaleString();
    }
    return '';
  };

  const getDisplayValue = () => {
    if (type === 'date' || type === 'time' || type === 'datetime') {
      return value ? formatDateValue(value as Date) : '';
    }
    return value as string;
  };

  const getDateTimeIcon = () => {
    if (type === 'date') {
      return <Ionicons name="calendar-outline" size={20} color={theme.colors.textLight} />;
    } else if (type === 'time') {
      return <Ionicons name="time-outline" size={20} color={theme.colors.textLight} />;
    } else if (type === 'datetime') {
      return <Ionicons name="calendar-outline" size={20} color={theme.colors.textLight} />;
    }
    return null;
  };

  const getDatePickerMode = () => {
    switch (type) {
      case 'date':
        return 'date';
      case 'time':
        return 'time';
      case 'datetime':
        return 'datetime';
      default:
        return 'date';
    }
  };

  const getDatePickerTitle = () => {
    switch (type) {
      case 'date':
        return 'Select Date';
      case 'time':
        return 'Select Time';
      case 'datetime':
        return 'Select Date & Time';
      default:
        return 'Select Date';
    }
  };

  const getPlaceholderText = () => {
    if (props.placeholder) {
      return props.placeholder;
    }
    
    if (type === 'date') {
      return t('components_common_input.datePlaceholder');
    } else if (type === 'time') {
      return t('components_common_input.timePlaceholder');
    } else if (type === 'datetime') {
      return t('components_common_input.datetimePlaceholder');
    }
    
    return '';
  };

  const renderPasswordToggle = () => {
    if (!secureTextEntry && type !== 'password') return null;

    return (
      <TouchableOpacity onPress={togglePasswordVisibility} style={styles.iconButton}>
        <Ionicons
          name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
          size={20}
          color={theme.colors.textLight}
        />
      </TouchableOpacity>
    );
  };

  // Date Picker Modal
  const DatePickerModal = useMemo(() => {
    if (!showDatePicker) return null;

    return (
      <>
        {Platform.OS === 'ios' ? (
          <Modal
            transparent={true}
            animationType="slide"
            visible={showDatePicker}
            onRequestClose={handleDatePickerCancel}
          >
            <View style={styles.datePickerModalOverlay}>
              <TouchableOpacity
                style={styles.datePickerModalBackdrop}
                activeOpacity={1}
                onPress={handleDatePickerCancel}
              />
              <View style={styles.datePickerModal}>
                <View style={styles.datePickerModalHeader}>
                  <TouchableOpacity onPress={handleDatePickerCancel}>
                    <Text style={styles.datePickerModalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={styles.datePickerModalTitle}>{getDatePickerTitle()}</Text>
                  <TouchableOpacity onPress={handleDatePickerConfirm}>
                    <Text style={[styles.datePickerModalButton, styles.datePickerModalConfirm]}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={tempDate}
                  mode={getDatePickerMode()}
                  display="spinner"
                  onChange={handleDateTimeChange}
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  themeVariant="light"
                  style={styles.datePickerIOS}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value ? (typeof value === 'string' ? new Date(value) : value) : new Date()}
            mode={getDatePickerMode()}
            display="default"
            onChange={handleDateTimeChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            themeVariant="light"
          />
        )}
      </>
    );
  }, [showDatePicker, tempDate, value, minimumDate, maximumDate, handleDateTimeChange, handleDatePickerCancel, handleDatePickerConfirm, getDatePickerMode, getDatePickerTitle, styles]);

  const renderInput = () => {
    if (type === 'date' || type === 'time' || type === 'datetime') {
      return (
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            style
          ]}
          onPress={handleDateTimePress}
        >
          {leftIcon && (
            <View style={styles.leftIconContainer}>
              {leftIcon}
            </View>
          )}

          <View style={styles.dateTimeTextContainer}>
            <Text style={[
              styles.dateTimeText,
              !value && styles.placeholderText
            ]}>
              {getDisplayValue() || getPlaceholderText()}
            </Text>
          </View>

          <View style={styles.rightIconContainer}>
            {getDateTimeIcon()}
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <View style={[
        styles.inputContainer,
        props.multiline && styles.inputContainerMultiline,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        style
      ]}>
        {leftIcon && !props.multiline && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[
            styles.input,
            props.multiline && styles.inputMultiline,
            leftIcon && !props.multiline && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry || type === 'password') && !props.multiline && styles.inputWithRightIcon,
          ]}
          secureTextEntry={(secureTextEntry || type === 'password') && !isPasswordVisible}
          placeholderTextColor={theme.colors.inputPlaceholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={getDisplayValue()}
          onChangeText={onChangeText}
          {...props}
        />

        {rightIcon && !props.multiline && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}

        {!props.multiline && renderPasswordToggle()}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      {renderInput()}

      {/* Date/Time Picker Modal */}
      {DatePickerModal}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelContainer: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    ...theme.typography.bodySmall,
    color: theme.colors.text,
    fontWeight: '500',
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  inputContainerFocused: {
    borderColor: theme.colors.inputFocusBorder,
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    minHeight: 80,
  },
  inputWithLeftIcon: {
    marginLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    marginRight: theme.spacing.sm,
  },
  leftIconContainer: {
    marginRight: theme.spacing.sm,
  },
  rightIconContainer: {
    marginLeft: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  dateTimeTextContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  dateTimeText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.inputPlaceholder,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // iOS DatePicker Modal styles (matching AddAppointmentModal and MyInfoSection)
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl || 20,
    borderTopRightRadius: theme.borderRadius.xl || 20,
    paddingBottom: 34, // Safe area bottom padding
    alignItems: 'center',
  },
  datePickerModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  datePickerModalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  datePickerModalButton: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontSize: 16,
  },
  datePickerModalConfirm: {
    fontWeight: '600',
  },
  datePickerIOS: {
    height: 200,
  },
});

export default Input;