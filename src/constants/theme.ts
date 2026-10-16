import { StyleSheet } from 'react-native';

export const COLORS = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  primary: '#6366F1',
  text: {
    primary: '#111827',
    secondary: '#4B5563',
    hint: '#FFFFFF',
  },
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#10B981',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const COMMON_STYLES = StyleSheet.create({
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    color: COLORS.text.primary,
    backgroundColor: COLORS.surface,
  },
  hint: {
    color: COLORS.text.hint,
    fontSize: 12,
    marginTop: SPACING.xs,
  },
});