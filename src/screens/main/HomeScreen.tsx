
import React, { useEffect, useState } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks/auth/useAuth';
import { useTheme } from '../../context/ThemeContext';
export const HomeScreen: React.FC = () => {
  const { signOut, session } = useAuth();
  const { mode, toggle, colors } = useTheme();
  const styles = getStyles(colors);
  const [fullName, setFullName] = useState<string>('');

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from('profiles').select('full_name, username').eq('id', session.user.id).single()
      .then(({ data }: { data: any }) => {
        if (data) setFullName(data.username || '');
      });
  }, [session?.user?.id]);

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Proximity</Text>
        <TouchableOpacity style={styles.toggleButton} onPress={toggle} activeOpacity={0.7}>
          <Ionicons 
            name={mode === 'dark' ? "sunny" : "moon"} 
            size={18} 
            color={mode === 'dark' ? "#FBBF24" : "#6366F1"} 
          />
          <Text style={styles.toggleText}>{mode === 'dark' ? 'Day' : 'Night'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={styles.title}>Hello{fullName ? `, ${fullName}` : ''}!</Text>
        <Text style={styles.subtitle}>You are successfully logged in and connected.</Text>

        <TouchableOpacity style={styles.button} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getStyles = (colors: any) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    width: '40%',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
