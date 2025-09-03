// constants/theme.ts
export const theme = {
  colors: {
    // Primary brand colors
    primary: '#08AFFA',
    
    white: '#FFFFFF',
    black: '#000000',

    blue25: 'E2F6FF',
    blue50: '#CDEFFF',
    blue100: '#ABE5FF',
    blue300: '#75D2FC',
    blue500: '#08AFFA',
    blue600: '#019DF5',

    gray25: '#FAFAFC',
    gray50: '#F8F8FA',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#121212',
    gray800: '#121212',

    green500: '#9FD456',

    error: '#FF4D4F',
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