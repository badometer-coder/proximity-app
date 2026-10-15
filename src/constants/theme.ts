/**
 * Theme constants for the Proximity Social App.
 * Updated to support a dark/black background theme.
 */

export const colors = {
  // Backgrounds
  background: '#000000', // Changed from '#F9FAFB' to pure black
  surface: '#111111',    // Slightly lighter than background for cards/inputs
  surfaceLight: '#1A1A1A',

  // Brand
  primary: '#6366F1',    // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',

  // Text
  text: {
    primary: '#F9FAFB',  // Changed from '#111827' to light gray/white for contrast on black
    secondary: '#9CA3AF',
    tertiary: '#6B7280',
    inverse: '#111827',  // For text on primary buttons
  },

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Borders
  border: '#374151',
  borderLight: '#4B5563',

  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
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
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.75,
  },
} as const;