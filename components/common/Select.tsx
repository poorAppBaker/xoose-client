// components/common/Select.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal'; // Import the new Modal component
import ContentHeader from '@/components/common/ContentHeader';

export interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  required?: boolean;
  value?: string | number | (string | number)[];
  onSelectionChange?: (value: string | number | (string | number)[]) => void;
  style?: ViewStyle;
  placeholder?: string;
  options: SelectOption[];
  multiple?: boolean;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  leftIcon,
  required = false,
  value,
  onSelectionChange,
  style,
  placeholder,
  options,
  multiple = false,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [tempSelection, setTempSelection] = useState<(string | number)[]>([]);

  const styles = createStyles(theme);

  const handlePress = useCallback(() => {
    if (disabled) return;

    // Initialize temp selection with current values
    if (multiple) {
      setTempSelection(Array.isArray(value) ? [...value] : value ? [value] : []);
    } else {
      setTempSelection(
        Array.isArray(value)
          ? value
          : value !== undefined && value !== null
            ? [value]
            : []
      );
    }

    setShowModal(true);
    setIsFocused(true);
  }, [disabled, multiple, value]);

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setIsFocused(false);
  }, []);

  const handleOptionPress = useCallback((optionValue: string | number) => {
    if (multiple) {
      setTempSelection(prev => {
        if (prev.includes(optionValue)) {
          return prev.filter(v => v !== optionValue);
        } else {
          return [...prev, optionValue];
        }
      });
    } else {
      setTempSelection([optionValue]);
    }
  }, [multiple]);

  const handleConfirm = useCallback(() => {
    if (onSelectionChange) {
      if (multiple) {
        onSelectionChange(tempSelection);
      } else {
        onSelectionChange(tempSelection[0] || '');
      }
    }
    handleModalClose();
  }, [tempSelection, onSelectionChange, multiple, handleModalClose]);

  const handleCancel = useCallback(() => {
    handleModalClose();
  }, [handleModalClose]);

  const getDisplayValue = useCallback(() => {
    if (!value) return '';

    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return '';
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option?.label || '';
      }
      return `${value.length} selected`;
    } else {
      const singleValue = Array.isArray(value) ? value[0] : value;
      const option = options.find(opt => opt.value === singleValue);
      return option?.label || '';
    }
  }, [value, options, multiple]);

  const getPlaceholderText = useCallback(() => {
    if (placeholder) return placeholder;
    return multiple ? 'Select options...' : 'Select an option...';
  }, [placeholder, multiple]);

  const renderOptionItem = useCallback(({ item }: { item: SelectOption }) => {
    const isSelected = tempSelection.includes(item.value);

    return (
      <TouchableOpacity
        style={[
          styles.optionItem,
          isSelected && styles.optionItemSelected
        ]}
        onPress={() => handleOptionPress(item.value)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.optionText,
          isSelected && styles.optionTextSelected
        ]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  }, [tempSelection, handleOptionPress, styles]);

  const SelectModal = useMemo(() => {
    if (!showModal) return null;

    return (
      <Modal
        visible={showModal}
        onClose={handleCancel}
      >
        {/* Header */}
        <ContentHeader title={placeholder || ""} onBackPress={handleCancel} />

        {/* Options List */}
        <FlatList
          data={options}
          renderItem={renderOptionItem}
          keyExtractor={(item) => item.value.toString()}
          style={styles.optionsList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.modalBottom}>
          <Button variant="outline" title="Cancel" onPress={handleCancel} />
          <View style={{ flex: 1, marginLeft: theme.spacing.sm }}>
            <Button
              variant="primary"
              fullWidth
              title="Select"
              onPress={handleConfirm}
              disabled={tempSelection.length === 0}
            />
          </View>
        </View>
      </Modal>
    );
  }, [showModal, options, tempSelection, handleCancel, handleConfirm, renderOptionItem, placeholder, theme.colors.blue500, theme.spacing.sm, styles]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelBorderOverlay} />
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.selectContainer,
          isFocused && styles.selectContainerFocused,
          error && styles.selectContainerError,
          disabled && styles.selectContainerDisabled,
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={[
            styles.text,
            !getDisplayValue() && styles.placeholderText
          ]}>
            {getDisplayValue() || getPlaceholderText()}
          </Text>
        </View>

        <View style={styles.rightIconContainer}>
          <Ionicons
            name="chevron-down"
            size={20}
            color={disabled ? theme.colors.gray300 : theme.colors.gray500}
          />
        </View>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {SelectModal}
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
  selectContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray50,
    paddingHorizontal: theme.spacing.md + theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.gray100,
    borderRadius: 1000,
    minHeight: 48,
  },
  selectContainerFocused: {
    borderColor: theme.colors.blue500,
    borderWidth: 1,
  },
  selectContainerError: {
    borderColor: theme.colors.error,
    borderWidth: 2,
  },
  selectContainerDisabled: {
    opacity: 0.6,
    backgroundColor: theme.colors.gray50,
  },
  leftIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  text: {
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
  },
  placeholderText: {
    color: theme.colors.gray300,
  },
  rightIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
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

  // Modal content styles (no longer need overlay, backdrop, modal container, topBar styles)
  modalHeader: {
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
  modalBottom: {
    flexDirection: 'row',
  },

  // Options list styles
  optionsList: {
    maxHeight: 400,
    marginVertical: theme.spacing.md,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    borderColor: 'transparent',
  },
  optionItemSelected: {
    borderColor: theme.colors.blue500,
  },
  optionText: {
    ...(theme.typography?.body || {}),
    fontSize: 16,
    color: theme.colors.gray800,
    flex: 1,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
});

export default Select;