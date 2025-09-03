// constants/theme.ts
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#f48b1c',
    primaryLight: '#fb923c',
    primaryDark: '#ea580c',

    // Secondary colors
    secondary: '#112d74',
    secondaryLight: '#3b82f6',
    secondaryDark: '#0D1B34',

    // Background colors
    background: '#D4E0F1',
    backgroundSurface: '#D4E0F1',
    backgroundCard: '#FFFFFF',

    // Text colors
    text: '#1f2937',
    textSecondary: '#6b7280',
    textLight: '#9ca3af',
    textWhite: '#ffffff',

    // Status colors
    error: '#ef4444',
    errorLight: '#fee2e2',
    success: '#10b981',
    warning: '#f59e0b',

    // Border and divider colors
    border: '#e5e7eb',
    divider: '#D4E0F1',

    // Input colors
    inputBackground: '#F5F2FF',
    inputBorder: '#e5e7eb',
    inputReadOnly: '#EBE7F6',
    inputPlaceholder: '#5B5B5B',
    inputFocusBorder: '#FDC078',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 38,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 30,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 18,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 20,
    },
  },

  shadows: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    primaryMd: {
      shadowColor: '#fd8b19', // base color without alpha
      shadowOffset: { width: 0, height: 4 }, // average of 3px and 6px
      shadowOpacity: 0.2, // blend of 0.25 and 0.15
      shadowRadius: 10, // average of 10 and 20
      elevation: 5, // Android shadow depth
    },
    secondaryLg: {
      shadowColor: '#003075', // dominant color (dark blue)
      shadowOffset: { width: 0, height: 6 }, // blended average of 10, 4, 1
      shadowOpacity: 0.08, // average blended from 0.08, 0.04, 0.02
      shadowRadius: 12, // blended blur from 40, 20, 4
      elevation: 6, // Android approximation
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 15,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 25,
      elevation: 5,
    },
    button: {
      shadowColor: '#FD8B19',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    },
    buttonHover: {
      shadowColor: '#FD8B19',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;