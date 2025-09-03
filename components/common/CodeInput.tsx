// First install the package:
// npm install react-native-otp-entry
// or
// yarn add react-native-otp-entry

// components/common/CodeInput.tsx
import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { ViewStyle, TextStyle } from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useTheme } from '../../contexts/ThemeContext';

interface CodeInputProps {
  numberOfDigits?: number;
  onCodeComplete?: (code: string) => void;
  onCodeChange?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  placeholder?: string;
}

export interface CodeInputRef {
  clear: () => void;
  focus: () => void;
  blur: () => void;
  setValue: (value: string) => void;
}

const CodeInput = forwardRef<CodeInputRef, CodeInputProps>(({
  numberOfDigits = 6,
  onCodeComplete,
  onCodeChange,
  disabled = false,
  autoFocus = true,
  secureTextEntry = false,
  style,
  placeholder = '',
}, ref) => {
  const { theme } = useTheme();
  const otpRef = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    clear: () => otpRef.current?.clear(),
    focus: () => otpRef.current?.focus(),
    blur: () => otpRef.current?.blur(),
    setValue: (value: string) => otpRef.current?.setValue(value),
  }));

  return (
    <OtpInput
      ref={otpRef}
      numberOfDigits={numberOfDigits}
      autoFocus={autoFocus}
      disabled={disabled}
      secureTextEntry={secureTextEntry}
      placeholder={placeholder}
      focusColor={theme.colors.primary}
      blurOnFilled={true}
      hideStick={false}
      focusStickBlinkingDuration={500}
      type="numeric"
      onTextChange={onCodeChange}
      onFilled={onCodeComplete}
      theme={{
        containerStyle: {
          gap: theme.spacing.sm,
          justifyContent: 'space-between',
          ...style,
        },
        pinCodeContainerStyle: {
          height: 56,
          width: 48,
          borderRadius: theme.borderRadius.lg,
          borderWidth: 1,
          borderColor: theme.colors.gray200,
          backgroundColor: theme.colors.gray25,
          ...theme.shadows.sm,
        },
        focusedPinCodeContainerStyle: {
          borderColor: theme.colors.primary,
          backgroundColor: '#ffffff',
          ...theme.shadows.md,
        },
        filledPinCodeContainerStyle: {
          borderColor: theme.colors.primary,
          backgroundColor: '#ffffff',
        },
        disabledPinCodeContainerStyle: {
          backgroundColor: theme.colors.gray100,
          borderColor: theme.colors.gray200,
          opacity: 0.6,
        },
        pinCodeTextStyle: {
          fontSize: 24,
          fontWeight: '600',
          color: theme.colors.gray600,
        },
        placeholderTextStyle: {
          fontSize: 24,
          fontWeight: '400',
          color: theme.colors.gray400,
        },
        focusStickStyle: {
          backgroundColor: theme.colors.primary,
          height: 2,
          width: 24,
        },
      }}
      textInputProps={{
        accessibilityLabel: 'One-Time Password Input',
        testID: 'otp-input',
      }}
      textProps={{
        allowFontScaling: false,
      }}
    />
  );
});

CodeInput.displayName = 'CodeInput';

export default CodeInput;