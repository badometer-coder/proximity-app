import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as Updates from 'expo-updates';
import * as ImagePicker from 'expo-image-picker';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { useAuth } from './src/hooks/auth/useAuth';
import { LoginScreen } from './src/screens/auth/LoginScreen';
import { ProfileSetupScreen } from './src/screens/auth/ProfileSetupScreen';
import { HomeScreen } from './src/screens/main/HomeScreen';
import ProximityFeedScreen from './src/screens/main/ProximityFeedScreen';
import { ChatThreadScreen } from './src/screens/main/ChatThreadScreen';
import { supabase } from './src/config/supabase';
import { theme } from './src/constants/theme';
import { UserProfile } from './src/types';

const Tab = createBottomTabNavigator();

function ProfileSettingsScreen() {
  const { session, signOut } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      if (data) setProfile(data as UserProfile);
      setLoading(false);
    }
    fetchProfile();
  }, [session]);

  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setIsUploading(true);
      try {
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;

        const formData = new FormData();
        formData.append('file', { uri, name: filename, type } as any);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(`${session?.user?.id}/${Date.now()}.jpg`, formData as any);
        
        if (uploadError) throw uploadError;
        
        const { data: publicData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        
        const { error: updateError } = await (supabase as any)
          .from('profiles')
          .update({ avatar_url: publicData.publicUrl })
          .eq('id', session?.user?.id);
        
        if (updateError) throw updateError;
        
        setProfile({ ...profile!, avatar_url: publicData.publicUrl });
        Alert.alert('Success', 'Avatar updated!');
      } catch (err: any) {
        console.error('Upload Error Details:', err);
        Alert.alert('Upload Error', err.message || 'Check your internet or Supabase permissions.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={[styles.profileContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text.primary }]}>Profile & Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={[styles.avatarPlaceholder, { backgroundColor: colors.surfaceLight }]} onPress={handleChangeAvatar} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator color={colors.primary.main} />
          ) : profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={50} color={colors.text.secondary} />
          )}
        </TouchableOpacity>

        <Text style={[styles.label, { color: colors.text.secondary }]}>Full Name</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>{profile?.full_name || 'Not set'}</Text>

        <Text style={[styles.label, { color: colors.text.secondary }]}>Username</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>@{profile?.username || 'not_set'}</Text>

        <Text style={[styles.label, { color: colors.text.secondary }]}>Email</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>{session?.user?.email}</Text>

        <Text style={[styles.label, { color: colors.text.secondary }]}>Age</Text>
        <Text style={[styles.value, { color: colors.text.primary }]}>{profile?.age || 'Not set'}</Text>
      </View>

      <TouchableOpacity style={[styles.signOutButton, { backgroundColor: colors.error }]} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ChatListScreen } from './src/screens/main/ChatListScreen';

const Stack = createNativeStackNavigator();

function ChatStack() {
  const { session } = useAuth();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="ChatThread" component={({ route, navigation }: any) => (
        <ChatThreadScreen 
          peerId={route.params?.peerId} 
          peerName={route.params?.peerName} 
          myId={session?.user?.id ?? null} 
          onBack={() => navigation.goBack()} 
        />
      )} />
    </Stack.Navigator>
  );
}

function MainTabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'home';

          if (route.name === 'HomeScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProximityFeedScreen') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'ChatStack') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileSettings') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeScreen" 
        component={HomeScreen} 
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="ProximityFeedScreen" 
        component={ProximityFeedScreen} 
        options={{ title: 'Proximity Feed' }}
      />
      <Tab.Screen 
        name="ChatStack" 
        component={ChatStack} 
        options={{ title: 'Chats' }}
      />
      <Tab.Screen 
        name="ProfileSettings" 
        component={ProfileSettingsScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const { colors } = useTheme();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    async function checkProfile() {
      if (!session?.user?.id) {
        setProfileComplete(null);
        return;
      }
      setCheckingProfile(true);
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', session.user.id)
        .single();
      
      if (data && (data as any).username) {
        setProfileComplete(true);
      } else {
        setProfileComplete(false);
      }
      setCheckingProfile(false);
    }
    checkProfile();
  }, [session]);

  if (loading || checkingProfile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  if (profileComplete === false) {
    return <ProfileSetupScreen onComplete={() => setProfileComplete(true)} />;
  }

  return (
    <NavigationContainer>
      <MainTabNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) {
        console.log('Running in development mode — OTA updates skipped.');
        return;
      }
      try {
        console.log('Checking for OTA updates...');
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          console.log('Update available, fetching...');
          await Updates.fetchUpdateAsync();
          console.log('Update fetched, reloading app...');
          await Updates.reloadAsync();
        } else {
          console.log('App is up to date.');
        }
      } catch (e: any) {
        console.error('Error checking for updates:', e?.message || e);
      }
    }
    checkForUpdates();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    marginBottom: 16,
    padding: 20,
    borderRadius: 60,
    width: 100,
    height: 100,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});