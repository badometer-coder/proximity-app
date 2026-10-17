import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../hooks/auth/useAuth';
import { theme } from '../../constants/theme';

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('test@test.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    const { error } = await signIn(email, password);
    setIsLoading(false);
    if (error) Alert.alert('Login Failed', error.message);
  };

  const handleSignup = async () => {
    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);
    if (error) Alert.alert('Signup Failed', error.message);
    else Alert.alert('Success', 'Account created! You can now log in.');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Proximity</Text>
        <Text style={styles.subtitle}>Find people nearby</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
          <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Log In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={handleSignup} disabled={isLoading}>
          <Text style={styles.buttonTextOutline}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  inner: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 36, fontWeight: 'bold', color: theme.colors.primary.main, textAlign: 'center' },
  subtitle: { fontSize: 16, color: theme.colors.text.secondary, marginBottom: 40, textAlign: 'center' },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 16, color: '#FFFFFF' },
  button: { backgroundColor: theme.colors.primary.main, padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  buttonOutline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.colors.primary.main },
  buttonTextOutline: { color: theme.colors.primary.main, fontSize: 16, fontWeight: '600' },
});