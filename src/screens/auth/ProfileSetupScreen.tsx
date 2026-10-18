import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../hooks/auth/useAuth';
import { supabase } from '../../config/supabase';
import { theme } from '../../constants/theme';

interface ProfileSetupScreenProps {
  onComplete: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({ onComplete }: ProfileSetupScreenProps) => {
  const { session } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow access to your photos.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!fullName || !username || !age) return Alert.alert('Error', 'Please fill out all fields.');
    setIsLoading(true);

    let publicUrl = null;
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const filename = `${session?.user?.id}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filename, blob, { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;
        
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(filename);
        publicUrl = publicData.publicUrl;
      } catch (err: any) {
        setIsLoading(false);
        return Alert.alert('Upload Error', err.message);
      }
    }

    const { error } = await (supabase as any)
      .from('profiles')
      .update({ 
        full_name: fullName, 
        username: username.toLowerCase(), 
        age: parseInt(age, 10),
        avatar_url: publicUrl 
      })
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

        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          <View style={styles.avatar}>
             {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%', borderRadius: 60 }} />
             ) : (
                <Text style={{color: '#999'}}>Add Photo</Text>
             )}
          </View>
        </TouchableOpacity>

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
  avatarContainer: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.text.primary, marginBottom: 8 },
  subtitle: { fontSize: 15, color: theme.colors.text.secondary, marginBottom: 32 },
  input: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, padding: 14, fontSize: 15, marginBottom: 16, color: theme.colors.text.primary },
  button: { backgroundColor: theme.colors.primary.main, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});