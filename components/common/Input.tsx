// components/common/Input.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, Platform, ViewStyle, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from 'react-native-wheel-pick';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/common/Button';

type BaseInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;

interface InputProps extends BaseInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  type?: 'text' | 'password' | 'date' | 'time' | 'datetime';
  value?: string | Date;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  onDateTimeChange?: (date: Date) => void;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  loading?: boolean;
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
  placeholder = "",
  onDateTimeChange,
  style,
  onChangeText,
  minimumDate = new Date('1900-1-1'),
  maximumDate = new Date(),
  loading = false,
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

  const handlePickerConfirm = useCallback(() => {
    if (onDateTimeChange) {
      onDateTimeChange(tempDate);
    }
    setShowDatePicker(false);
  }, [tempDate, onDateTimeChange]);

  const handlePickerCancel = useCallback(() => {
    setShowDatePicker(false);
  }, []);

  const formatDateValue = (date: Date | string) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (type === 'date') {
      return dateObj.toLocaleDateString('en-US', {
        month: 'short', // Jan
        day: '2-digit', // 18
        year: 'numeric', // 1989
      });
    } else if (type === 'time') {
      return dateObj.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (type === 'datetime') {
      return dateObj.toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
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
    return <Ionicons name="chevron-down" size={20} color={theme.colors.gray500} />;
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
    if (placeholder) {
      return placeholder;
    }

    if (type === 'date') {
      return t('components_common_input.datePlaceholder') || 'Select date';
    } else if (type === 'time') {
      return t('components_common_input.timePlaceholder') || 'Select time';
    } else if (type === 'datetime') {
      return t('components_common_input.datetimePlaceholder') || 'Select date & time';
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
          color={theme.colors.gray500}
        />
      </TouchableOpacity>
    );
  };

  const renderLoadingIndicator = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  // Date Picker Modal with react-native-wheel-pick DatePicker
  const DatePickerModal = useMemo(() => {
    if (!showDatePicker) return null;

    return (
      <Modal
        transparent={true}
        animationType="slide"
        visible={showDatePicker}
        onRequestClose={handlePickerCancel}
      >
        <View style={styles.datePickerModalOverlay}>
          <TouchableOpacity
            style={styles.datePickerModalBackdrop}
            activeOpacity={1}
            onPress={handlePickerCancel}
          />
          <View style={styles.datePickerModal}>
            <View style={styles.modalTopBar}>
              <View style={styles.modalTopBarLine} />
            </View>
            {/* Header */}
            <View style={styles.datePickerModalHeader}>
              <TouchableOpacity>
                <Ionicons size={24} name="arrow-back" color={theme.colors.blue500} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{placeholder || "Select the option"}</Text>
            </View>

            {/* DatePicker Container */}
            <View style={styles.datePickerContainer}>
              <DatePicker
                order={type === 'time' ? 'H-m' : type === 'datetime' ? 'M-D-Y-H-m' : 'M-D-Y'}
                date={tempDate}
                onDateChange={setTempDate}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.wheelDatePicker}
                textColor={theme.colors.gray600}
                textSize={18}
              />
            </View>

            <View style={styles.modalBottom}>
              <Button variant="outline" title="Cancel" onPress={handlePickerCancel} />
              <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
                <Button variant="primary" fullWidth title="Select" onPress={handlePickerConfirm} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }, [showDatePicker, tempDate, handlePickerCancel, handlePickerConfirm, getDatePickerTitle, minimumDate, maximumDate, type, theme.colors.gray800, styles]);

  const renderInput = () => {
    if (type === 'date' || type === 'time' || type === 'datetime') {
      return (
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            loading && styles.inputContainerDisabled,
            style
          ]}
          onPress={handleDateTimePress}
          disabled={loading}
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

          {loading ? (
            renderLoadingIndicator()
          ) : (
            <View style={styles.rightIconContainer}>
              {getDateTimeIcon()}
            </View>
          )}
        </TouchableOpacity>
      );
    }

    return (
      <View style={[
        styles.inputContainer,
        props.multiline && styles.inputContainerMultiline,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError,
        loading && styles.inputContainerDisabled,
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
            (rightIcon || secureTextEntry || type === 'password' || loading) && !props.multiline && styles.inputWithRightIcon,
          ]}
          secureTextEntry={(secureTextEntry || type === 'password') && !isPasswordVisible}
          placeholderTextColor={theme.colors.gray300}
          placeholder={getPlaceholderText()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={getDisplayValue()}
          onChangeText={onChangeText}
          editable={!loading}
          {...props}
        />

        {loading && renderLoadingIndicator()}

        {rightIcon && !props.multiline && !loading && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}

        {!props.multiline && !loading && renderPasswordToggle()}
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

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Date/Time Picker Modal */}
      {DatePickerModal}
    </View>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    position: 'relative',
  },
  labelContainer: {
    position: 'absolute',
    left: 18,
    top: -8,
    zIndex: 10,
  },
  label: {
    fontSize: 12,
    color: theme.colors.gray500,
    fontWeight: '700',
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: 1000,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    minHeight: 100,
    paddingVertical: theme.spacing.sm,
  },
  inputContainerFocused: {
    borderColor: theme.colors.blue500,
    borderWidth: 1,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  inputContainerDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.gray50,
  },
  input: {
    flex: 1,
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
    paddingLeft: 0,
    paddingRight: 0,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    minHeight: 80,
  },
  inputWithLeftIcon: {
  },
  inputWithRightIcon: {
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    marginLeft: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateTimeTextContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  dateTimeText: {
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
  },
  placeholderText: {
    color: theme.colors.gray300,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  errorText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // Custom DatePicker Modal styles
  datePickerModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  datePickerModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: 34, // Safe area bottom padding
    maxHeight: '70%',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  modalTopBar: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalTopBarLine: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray200,
    width: 100,
    height: 5,
  },
  datePickerModalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  modalTitle: {
    ...(theme.typography?.h3 || {}),
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.gray800,
  },
  datePickerModalButton: {
    ...(theme.typography?.body || {}),
    color: theme.colors.blue500,
    fontSize: 16,
  },
  datePickerModalConfirm: {
    fontWeight: '600',
  },

  // DatePicker container styles
  datePickerContainer: {
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  wheelDatePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'white'
  },
  modalBottom: {
    flexDirection: 'row',
  },
});

export default Input;