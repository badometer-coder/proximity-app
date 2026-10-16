import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { theme } from '../constants/theme';

export function HomeScreen() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const currentTheme = {
    background: isDarkMode ? theme.colors.background : '#FFFFFF',
    surface: isDarkMode ? theme.colors.surface : '#F3F4F6',
    text: isDarkMode ? theme.colors.text.primary : theme.colors.text.inverse,
    secondaryText: isDarkMode ? theme.colors.text.secondary : theme.colors.text.tertiary,
    border: isDarkMode ? theme.colors.border : '#E5E7EB',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentTheme.text }]}>Welcome Home</Text>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}
          onPress={() => setIsDarkMode(!isDarkMode)}
        >
          <Text style={[styles.toggleButtonText, { color: currentTheme.text }]}>
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.card, { backgroundColor: currentTheme.surface, borderColor: currentTheme.border }]}>
        <Text style={[styles.cardTitle, { color: currentTheme.text }]}>Theme Status</Text>
        <Text style={[styles.cardDescription, { color: currentTheme.secondaryText }]}>
          Current active theme is {isDarkMode ? 'Dark' : 'Light'}. Toggle the button above to switch between themes.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
  },
  toggleButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
  },
  toggleButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing.sm,
  },
  cardDescription: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
});