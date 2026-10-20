import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/auth/useAuth';
import { useTheme } from '../../context/ThemeContext';

export const HomeScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { mode, toggle, colors } = useTheme();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.toggleButton, { backgroundColor: colors.surface, borderColor: colors.border }]} 
          onPress={toggle} 
          activeOpacity={0.7}
        >
          <Ionicons 
            name={mode === 'dark' ? "sunny" : "moon"} 
            size={20} 
            color={mode === 'dark' ? "#FBBF24" : "#6366F1"} 
          />
          <Text style={[styles.toggleText, { color: colors.text.primary }]}>
            {mode === 'dark' ? 'Day Mode' : 'Night Mode'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={[styles.title, { color: colors.text.primary }]}>Proximity</Text>
        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>You are successfully logged in.</Text>

        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary.main }]} onPress={handleSignOut}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
