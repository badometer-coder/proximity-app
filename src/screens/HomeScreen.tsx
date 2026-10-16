import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../constants/theme';

export const HomeScreen: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const currentColors = isDarkMode
    ? {
        background: theme.colors.background,
        surface: theme.colors.surface,
        text: theme.colors.text.primary,
        secondaryText: theme.colors.text.secondary,
        buttonBg: theme.colors.primary.main,
      }
    : {
        background: '#FFFFFF',
        surface: '#F3F4F6',
        text: '#111827',
        secondaryText: '#4B5563',
        buttonBg: theme.colors.primary.dark,
      };

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
        <Text style={[styles.title, { color: currentColors.text }]}>Welcome Home</Text>
        <Text style={[styles.subtitle, { color: currentColors.secondaryText }]}>
          Current theme: {isDarkMode ? 'Dark' : 'Light'}
        </Text>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: currentColors.buttonBg }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Text style={styles.buttonText}>
            Switch to {isDarkMode ? 'Light' : 'Dark'} Mode
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xl,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});