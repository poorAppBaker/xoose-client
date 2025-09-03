import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  label: string;
  theme: any;
  onLinkPress?: () => void;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onPress,
  label,
  theme,
  onLinkPress
}) => {
  const styles = createStyles(theme);

  const renderLabel = () => {
    // Split text to identify clickable links
    const parts = label.split(/(\bTerms & Conditions\b|\bPrivacy Policy\b)/);

    return (
      <Text style={styles.label}>
        {parts.map((part, index) => {
          if (part === 'Terms & Conditions' || part === 'Privacy Policy') {
            return (
              <Text
                key={index}
                style={styles.linkText}
                onPress={onLinkPress}
              >
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.checkbox, checked && styles.checked]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <View style={styles.labelContainer}>
        {renderLabel()}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.gray300 || '#D1D5DB',
    borderRadius: 4,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: theme.colors.blue500 || '#3B82F6',
    borderColor: theme.colors.blue500 || '#3B82F6',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: theme.colors.gray700 || '#374151',
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.blue500 || '#3B82F6',
    textDecorationLine: 'underline',
  },
});

export default Checkbox;