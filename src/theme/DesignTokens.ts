```typescript
/**
 * Design Tokens for Proximity Social App
 * Centralized source of truth for all UI constants
 */

export const Colors = {
  // Primary
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  primaryLight: '#A5B4FC',
  primaryBackground: '#EEF2FF',

  // Secondary
  secondary: '#10B981',
  secondaryDark: '#059669',
  secondaryLight: '#6EE7B7',

  // Neutral
  white: '#FFFFFF',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  black: '#000000',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Status
  online: '#22C55E',
  offline: '#9CA3AF',
  away: '#F59E0B',
  busy: '#EF4444',

  // Chat
  chatBubbleSent: '#6366F1',
  chatBubbleReceived: '#F3F4F6',
  chatTextSent: '#FFFFFF',
  chatTextReceived: '#1F2937',
} as const;

export const Spacing = {
  /** 4px - micro spacing (icons, small gaps) */
  xs: 4,
  /** 8px - standard small spacing */
  sm: 8,
  /** 12px - medium small spacing */
  md: 12,
  /** 16px - standard spacing */
  base: 16,
  /** 20px - medium large spacing */
  lg: 20,
  /** 24px - large spacing */
  xl: 24,
  /** 32px - extra large spacing */
  xxl: 32,
  /** 40px - section spacing */
  xxxl: 40,
} as const;

export const BorderRadius = {
  /** 4px - subtle rounding */
  sm: 4,
  /** 8px - standard rounding */
  md: 8,
  /** 12px - card rounding */
  lg: 12,
  /** 16px - large card rounding */
  xl: 16,
  /** 24px - hero/feature rounding */
  xxl: 24,
  /** 9999px - fully rounded (pills, circles) */
  full: 9999,
} as const;

export const FontSizes = {
  /** 12px - captions, labels */
  xs: 12,
  /** 14px - body small, metadata */
  sm: 14,
  /** 16px - body text */
  base: 16,
  /** 18px - subheading */
  lg: 18,
  /** 20px - heading small */
  xl: 20,
  /** 24px - heading */
  xxl: 24,
  /** 32px - hero