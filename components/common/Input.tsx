// components/common/Input.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, TextInputProps, Platform, ViewStyle, ActivityIndicator, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DatePicker } from 'react-native-wheel-pick';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/common/Button';
import ContentHeader from '@/components/common/ContentHeader';
import Modal from '@/components/common/Modal';

type BaseInputProps = Omit<TextInputProps, 'value' | 'onChangeText' | 'style'>;

interface InputProps extends BaseInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
  type?: 'text' | 'password' | 'date' | 'time' | 'datetime';
  value?: string | Date | null;
  placeholder?: string;
  placeholderFontSize?: number;
  onChangeText?: (text: string) => void;
  onDateTimeChange?: (date: Date) => void;
  style?: ViewStyle;
  minimumDate?: Date;
  maximumDate?: Date;
  loading?: boolean;
  height?: number;
  placeholderStyle?: TextStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  secureTextEntry,
  required = false,
  type = 'text',
  height = 45,
  value,
  placeholder = "",
  placeholderFontSize = 16,
  placeholderTextColor = "#D1D5DB",
  placeholderStyle,
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

  const styles = createStyles(theme, height, !!error, placeholderFontSize);

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
        visible={showDatePicker}
        onClose={handlePickerCancel}
      >
        {/* Header */}
        <ContentHeader title={placeholder} />

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
            textSize={20}
          />
        </View>

        <View style={styles.modalBottom}>
          <Button style={styles.cancelButton} variant="outline" title="Cancel" onPress={handlePickerCancel} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button variant="primary" fullWidth title="Select" onPress={handlePickerConfirm} />
          </View>
        </View>
      </Modal>
    );
  }, [showDatePicker, tempDate, handlePickerCancel, handlePickerConfirm, minimumDate, maximumDate, type, styles]);

  const renderInput = () => {
    if (type === 'date' || type === 'time' || type === 'datetime') {
      return (
        <TouchableOpacity
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            error && styles.inputContainerError,
            loading && styles.inputContainerDisabled
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
        loading && styles.inputContainerDisabled
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
          placeholderTextColor={placeholderFontSize !== 16 ? 'transparent' : (placeholderTextColor || theme.colors.gray300)}
          placeholder={placeholderFontSize !== 16 ? '' : getPlaceholderText()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={getDisplayValue()}
          onChangeText={onChangeText}
          editable={!loading}
          {...props}
        />

        {/* Custom placeholder overlay when fontSize is different */}
        {placeholderFontSize !== 16 && !getDisplayValue() && (
          <Text style={[styles.customPlaceholder, { fontSize: placeholderFontSize }, placeholderStyle]}>
            {getPlaceholderText()}
          </Text>
        )}

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
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelBorderOverlay} />
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

const createStyles = (theme: any, height: number, hasError: boolean, placeholderFontSize: number) => StyleSheet.create({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.md,
    minHeight: hasError ? height + 25 : height, // Only reserve space when error exists
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
    paddingHorizontal: 2,
    fontWeight: '700',
  },
  labelBorderOverlay: {
    width: '100%',
    height: 2,
    backgroundColor: theme.colors.white,
    position: 'absolute',
    top: 8,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.full,
    height: height, // Fixed height for input
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    height: 'auto', // Allow multiline to grow
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
    minHeight: height,
  },
  customPlaceholder: {
    position: 'absolute',
    left: 47,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    pointerEvents: 'none',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    minHeight: 80,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.sm,
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
    height: height,
    justifyContent: 'center',
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
    marginLeft: theme.spacing.sm,
    height: 20, // Fixed height for error text
  },
  errorText: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
    flex: 1,
  },

  // DatePicker container styles
  datePickerContainer: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  wheelDatePicker: {
    width: '100%',
    height: 200,
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
  },
  modalBottom: {
    flexDirection: 'row',
  },
  cancelButton: {
    paddingHorizontal: 45,
  }
});

export default Input;