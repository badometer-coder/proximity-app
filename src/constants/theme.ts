export const colors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  primary: {
    main: '#6366F1',
    dark: '#4F46E5',
    light: '#818CF8',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#F9FAFB',
  },
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',
  orange: '#F97316',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  fontSize: {
    xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
} as const;
