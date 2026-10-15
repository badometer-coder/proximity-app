export const theme = {
  colors: {
    primary: {
      main: '#6366F1',
      light: '#EEF2FF',
      dark: '#4338CA',
      contrastText: '#FFFFFF',
    },
    success: '#22C55E',
    warning: '#EAB308',
    error: '#EF4444',
    orange: '#F97316',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    border: '#E5E7EB',
    divider: '#F3F4F6',
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },
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
    sizes: { xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32 },
    weights: { regular: '400' as const, medium: '500' as const, semibold: '600' as const, bold: '700' as const },
    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
  },
} as const;