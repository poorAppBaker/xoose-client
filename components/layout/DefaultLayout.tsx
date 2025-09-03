import React, { ReactNode } from 'react';
import { View, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface DefaultLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
  showKeyboardAvoidance?: boolean;
}

export default function DefaultLayout({
  children,
  scrollable = false,
  showKeyboardAvoidance = true
}: DefaultLayoutProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.scrollContentContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={styles.container}>
      {children}
    </View>
  );

  if (!showKeyboardAvoidance) {
    return content;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoidingView}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 50 : 0}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.secondary} />
      {content}
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    // flex: 1,
    flexGrow: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
});