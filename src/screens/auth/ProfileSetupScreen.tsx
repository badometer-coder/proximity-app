import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';
import { supabase } from '../../config/supabase';
import { theme } from '../../constants/theme';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }) => {
  const { session } = useAuth();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!fullName || !username || !age) return Alert.alert('Error', 'Please fill out all fields.');
    setIsLoading(true);
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ full_name: fullName, username: username.toLowerCase(), age: parseInt(age, 10) })
      .eq('id', session?.user?.id);
    setIsLoading(false);
    if (error) Alert.alert('Error saving profile', error.message);
    else onComplete(); 
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Setup Profile</Text>
        <Text style={styles.subtitle}>Tell us a bit about yourself</Text>

        <TextInput style={styles.input} placeholder="Full Name (e.g., John Doe)" value={fullName} onChangeText={setFullName} placeholderTextColor={theme.colors.text.tertiary} />
        <TextInput style={styles.input} placeholder="Username (e.g., john_doe)" value={username} onChangeText={setUsername} autoCapitalize="none" placeholderTextColor={theme.colors.text.tertiary} />
        <TextInput style={styles.input} placeholder="Age (must be 18+)" value={age} onChangeText={setAge} keyboardType="number-pad" placeholderTextColor={theme.colors.text.tertiary} />

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Saving...' : 'Save & Continue'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.colors.text.secondary, marginBottom: 32 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 16, color: theme.colors.text.primary },
  button: { backgroundColor: theme.colors.primary.main, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});