import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={styles.profileContainer}>
      <Text style={styles.title}>Profile & Settings</Text>
        <View style={styles.card}>
        <View style={styles.avatarPlaceholder}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={50} color={theme.colors.text.secondary} />
          )}
        </View>

        <Text style={styles.label}>Full Name</Text>
        <Text style={styles.value}>{profile?.full_name || 'Not set'}</Text>

        <Text style={styles.label}>Username</Text>
        <Text style={styles.value}>@{profile?.username || 'not_set'}</Text>


        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.user?.email}</Text>

        <Text style={styles.label}>Age</Text>
        <Text style={styles.value}>{profile?.age || 'Not set'}</Text>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: any = 'home'; // Fallback to any to avoid strict type issues

          if (route.name === 'HomeScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ProximityFeedScreen') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'ChatThreadScreen') {
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
        name="ChatThreadScreen" 
        component={() => {
          const { session } = useAuth();
          return (
            <ChatThreadScreen 
              peerId="" 
              peerName="General Chat" 
              myId={session?.user?.id ?? null} 
              onBack={() => {}} 
            />
          );
        }} 
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary.main} />
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
    backgroundColor: theme.colors.background,
  },
  profileContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 24,
    paddingTop: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 4,
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  signOutButton: {
    backgroundColor: theme.colors.error,
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
    backgroundColor: theme.colors.surfaceLight,
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