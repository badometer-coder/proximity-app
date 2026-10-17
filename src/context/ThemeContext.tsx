import React, { createContext, useContext, useState, ReactNode } from 'react';

export const lightColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  primary: { main: '#6366F1', dark: '#4F46E5', light: '#818CF8' },
  text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF', inverse: '#F9FAFB' },
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  overlay: 'rgba(0,0,0,0.5)',
};

export const darkColors = {
  background: '#000000',
  surface: '#111111',
  surfaceLight: '#1A1A1A',
  primary: { main: '#6366F1', dark: '#4F46E5', light: '#818CF8' },
  text: { primary: '#F9FAFB', secondary: '#9CA3AF', tertiary: '#6B7280', inverse: '#111827' },
  border: '#374151',
  borderLight: '#4B5563',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  overlay: 'rgba(0,0,0,0.7)',
};

type ThemeMode = 'light' | 'dark';
export type ThemeColors = typeof darkColors;

interface ThemeContextType {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  colors: darkColors,
  toggle: () => {},
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('dark');
  const colors = mode === 'dark' ? darkColors : lightColors;
  const toggle = () => setMode((m: ThemeMode) => m === 'dark' ? 'light' : 'dark');
  return (
    <ThemeContext.Provider value={{ mode, colors, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);